package app;

import com.worldsworstsoftware.itunes.ItunesTrack;
import com.worldsworstsoftware.itunes.parser.ItunesLibraryParser;
import com.worldsworstsoftware.itunes.parser.logging.DefaultParserStatusUpdateLogger;
import domain.Track;
import org.springframework.stereotype.Controller;
import org.springframework.util.StringUtils;
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
    public @ResponseBody List<Track> handleFileUpload(@RequestParam("file") MultipartFile file) {
        List<ItunesTrack> tracks = parseLibraryXML(file);
        return getTracks(tracks);
    }

    private List<Track> getTracks(List<ItunesTrack> iTracks) {
        List<Track> tracks = new ArrayList<>();
        Track track;
        for (ItunesTrack t : iTracks) {
            if (!Track.validTrackType(t.getKind())) {
                continue;
            }
            track = new Track();
            track.setTrackID(t.getTrackID());
            track.setName(t.getName());
            track.setArtist(t.getArtist());
            track.setAlbumName(t.getAlbum());
            track.setYear(t.getYear());
            track.setGenre(t.getGenre());
            track.setPlayCount(t.getPlayCount());
            track.setAlbumID(getAlbumID(track));
            tracks.add(track);
        }
        return tracks;
    }

    private String getAlbumID(Track track) {
        String albumName = track.getAlbumName();
        boolean hasAlbumName = !StringUtils.isEmpty(albumName);
        return String.format("%s_%d",
                hasAlbumName ? albumName : track.getArtist(),
                hasAlbumName ? track.getYear() : 1000);
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
//            logger.setTrackParseUpdateFrequency(200);
//            logger.setPlaylistParseUpdateFrequency(ParserStatusUpdateLogger.UPDATE_FREQUENCY_ALWAYS);

            tracks.addAll(ItunesLibraryParser.parseLibrary(temp.getAbsolutePath(), logger).getTracks().values());
            temp.delete();
        } catch (IOException e) {
            e.printStackTrace();
        }
        return tracks;
    }

}
