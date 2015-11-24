package app;

import com.worldsworstsoftware.itunes.ItunesTrack;
import com.worldsworstsoftware.itunes.parser.ItunesLibraryParser;
import com.worldsworstsoftware.itunes.parser.logging.DefaultParserStatusUpdateLogger;
import com.worldsworstsoftware.itunes.parser.logging.ParserStatusUpdateLogger;
import domain.Album;
import domain.LibraryByAlbum;
import domain.Track;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.*;
import java.util.ArrayList;
import java.util.List;
import java.util.Scanner;
import java.util.UUID;

@Controller
public class MainController {

    @RequestMapping(value="/upload", method= RequestMethod.POST)
    public @ResponseBody LibraryByAlbum handleFileUpload(@RequestParam("file") MultipartFile file, Model model) {
        List<ItunesTrack> tracks = parseLibraryXML(file);
        LibraryByAlbum library = sortByAlbum(tracks);
        model.addAttribute("library", library);
        return library;

    }

    private LibraryByAlbum sortByAlbum(List<ItunesTrack> tracks) {
        LibraryByAlbum library = new LibraryByAlbum();
        Track track;
        for (ItunesTrack t : tracks) {
            track = new Track();
            track.setTrackID(UUID.randomUUID());
            track.setName(t.getName());
            track.setArtist(t.getArtist());
            track.setAlbumName(t.getAlbum());
            track.setYear(t.getYear());
            track.setGenre(t.getGenre());
            track.setPlayCount(t.getPlayCount());
            track.setAlbumID(LibraryByAlbum.getAlbumID(track));
            library.addTrack(track);
        }
        return library;

    }

    List<ItunesTrack> parseLibraryXML(MultipartFile file) {
        String filename = UUID.randomUUID().toString();
        List<ItunesTrack> tracks = new ArrayList<>();
        try {
            File temp = File.createTempFile(filename, ".xml");
            Scanner inputReader = new Scanner(file.getInputStream());
            BufferedWriter outputWriter = new BufferedWriter(new FileWriter(temp, true));
            while (inputReader.hasNextLine()) {
                outputWriter.write(inputReader.nextLine());
                outputWriter.newLine();
            }
            inputReader.close();
            outputWriter.close();

            DefaultParserStatusUpdateLogger logger = new DefaultParserStatusUpdateLogger(true, System.out);
            logger.setTrackParseUpdateFrequency(200);
            logger.setPlaylistParseUpdateFrequency(ParserStatusUpdateLogger.UPDATE_FREQUENCY_ALWAYS);

            tracks.addAll(ItunesLibraryParser.parseLibrary(temp.getAbsolutePath(), logger).getTracks().values());
            temp.delete();
        } catch (IOException e) {
            e.printStackTrace();
        }
        return tracks;
    }

}
