package app;

import com.worldsworstsoftware.itunes.ItunesTrack;
import com.worldsworstsoftware.itunes.parser.ItunesLibraryParser;
import com.worldsworstsoftware.itunes.parser.logging.DefaultParserStatusUpdateLogger;
import com.worldsworstsoftware.itunes.parser.logging.ParserStatusUpdateLogger;
import org.springframework.stereotype.Controller;
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
    public @ResponseBody List<ItunesTrack> handleFileUpload(@RequestParam("file") MultipartFile file) {
        List<ItunesTrack> tracks = parseLibraryXML(file);
        return tracks;
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
