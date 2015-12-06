package domain;

import org.springframework.util.StringUtils;

import java.io.Serializable;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;
import java.util.UUID;

/**
 * Created by Kaila on 11/23/2015.
 */
public class Track implements Serializable {
    private static final long serialVersionUID = 1002L;
    private static final List<String> validTypes = new ArrayList<>(Arrays.asList("mpeg", "aac", "aiff", "wav"));
    private static final List<String> invalidTypes = new ArrayList<>(Arrays.asList("mpeg-4"));


    private int trackID;
    private String name;
    private String artist;
    private String albumID;
    private String albumName;
    private String genre;
    private int year;
    private int playCount;

    public int getTrackID() {
        return trackID;
    }

    public void setTrackID(int trackID) {
        this.trackID = trackID;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getArtist() {
        return artist;
    }

    public void setArtist(String artist) {
        this.artist = artist;
    }

    public String getAlbumID() {
        return albumID;
    }

    public void setAlbumID(String albumID) {
        this.albumID = albumID;
    }

    public String getAlbumName() {
        return albumName;
    }

    public void setAlbumName(String albumName) {
        this.albumName = albumName;
    }

    public String getGenre() {
        return genre;
    }

    public void setGenre(String genre) {
        this.genre = genre;
    }

    public int getYear() {
        return year;
    }

    public void setYear(int year) {
        this.year = year;
    }

    public int getPlayCount() {
        return playCount;
    }

    public void setPlayCount(int playCount) {
        this.playCount = playCount;
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;

        Track track = (Track) o;

        if (year != track.year) return false;
        if (albumName != null ? !albumName.equals(track.albumName) : track.albumName != null) return false;
        if (artist != null ? !artist.equals(track.artist) : track.artist != null) return false;
        if (genre != null ? !genre.equals(track.genre) : track.genre != null) return false;
        if (name != null ? !name.equals(track.name) : track.name != null) return false;

        return true;
    }

    @Override
    public int hashCode() {
        int result = trackID;
        result = 31 * result + (name != null ? name.hashCode() : 0);
        result = 31 * result + (artist != null ? artist.hashCode() : 0);
        result = 31 * result + (albumID != null ? albumID.hashCode() : 0);
        result = 31 * result + (albumName != null ? albumName.hashCode() : 0);
        result = 31 * result + (genre != null ? genre.hashCode() : 0);
        result = 31 * result + year;
        result = 31 * result + playCount;
        return result;
    }

    public static boolean validTrackType(String type) {
        if (!StringUtils.isEmpty(type)) {
            type = type.toLowerCase();
            for (String invalidType : invalidTypes) {
                if (type.contains(invalidType)) {
                    return false;
                }
            }
            for (String validType : validTypes) {
                if (type.contains(validType)) {
                    return true;
                }
            }
        }
        return false;
    }

    public static String getAlbumID(Track track) {
        String albumName = track.getAlbumName();
        boolean hasAlbumName = !StringUtils.isEmpty(albumName);
        return String.format("%s_%d",
                hasAlbumName ? albumName : track.getArtist(),
                hasAlbumName ? track.getYear() : 1000);
    }
}