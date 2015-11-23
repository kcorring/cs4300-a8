package app;

import com.worldsworstsoftware.itunes.ItunesLibrary;
import com.worldsworstsoftware.itunes.parser.ItunesLibraryParser;
import com.worldsworstsoftware.itunes.parser.logging.DefaultParserStatusUpdateLogger;
import com.worldsworstsoftware.itunes.parser.logging.ParserStatusUpdateLogger;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.*;
import java.util.Scanner;
import java.util.UUID;

@Controller
public class MainController {

    @RequestMapping(value="/upload", method= RequestMethod.POST)
    public @ResponseBody Integer handleFileUpload(@RequestParam("file") MultipartFile file) {
        ItunesLibrary library = parseLibraryXML(file);
        return library.getTracks().size();
    }

    ItunesLibrary parseLibraryXML(MultipartFile file) {
        String filename = UUID.randomUUID().toString();
        ItunesLibrary library = new ItunesLibrary();
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

            library = ItunesLibraryParser.parseLibrary(temp.getAbsolutePath(), logger);
            temp.delete();
        } catch (IOException e) {
            e.printStackTrace();
        }
        return library;
    }

}
