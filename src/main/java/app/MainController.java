package app;

import com.worldsworstsoftware.itunes.ItunesTrack;
import com.worldsworstsoftware.itunes.parser.ItunesLibraryParser;
import com.worldsworstsoftware.itunes.parser.logging.DefaultParserStatusUpdateLogger;
import domain.Track;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.*;
import java.util.ArrayList;
import java.util.List;
import java.util.Scanner;
import java.util.UUID;
import java.util.stream.Collectors;

@Controller
public class MainController {
    @RequestMapping(value = "/upload", method = RequestMethod.POST)
    public @ResponseBody List<Track> handleFileUpload(@RequestParam("file") MultipartFile file) {
        String filename = UUID.randomUUID().toString();
        List<Track> tracks = new ArrayList<>();
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

            tracks = parseLibraryXML(temp.getAbsolutePath());
            temp.delete();
        } catch (IOException e) {
            e.printStackTrace();
        }
        return tracks;
    }

    @RequestMapping(value = "/sample", method = RequestMethod.GET)
    public @ResponseBody List<Track> getSampleLibrary() {
        return parseLibraryXML("src/main/resources/sample_library.xml");
    }

    List<Track> parseLibraryXML(String filepath) {
        List<ItunesTrack> iTunesTracks = new ArrayList<>();
        List<Track> tracks = new ArrayList<>();
        DefaultParserStatusUpdateLogger logger = new DefaultParserStatusUpdateLogger(true, System.out);
//            logger.setTrackParseUpdateFrequency(200);
//            logger.setPlaylistParseUpdateFrequency(ParserStatusUpdateLogger.UPDATE_FREQUENCY_ALWAYS);

        iTunesTracks.addAll(ItunesLibraryParser.parseLibrary(filepath, logger).getTracks().values());

        if (iTunesTracks != null) {
            tracks = iTunesTracks.stream()
                    .filter(track -> Track.validTrackType(track.getKind()))
                    .map(t -> {
                        Track track = new Track();
                        track.setTrackID(t.getTrackID());
                        track.setName(t.getName());
                        track.setArtist(t.getArtist());
                        track.setAlbumName(t.getAlbum());
                        track.setYear(t.getYear());
                        track.setGenre(t.getGenre());
                        track.setPlayCount(t.getPlayCount());
                        track.setAlbumID(Track.getAlbumID(track));
                        return track;
                    }).collect(Collectors.toList());
        }
        return tracks;
    }


}
