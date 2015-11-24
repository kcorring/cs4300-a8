package domain;

import org.springframework.util.StringUtils;

import java.io.Serializable;
import java.util.*;

/**
 * Created by Kaila on 11/23/2015.
 */
public class LibraryByAlbum implements Serializable {
    private static final long serialVersionUID = 1000L;

    List<Album> children;

    public LibraryByAlbum() {
        children = new ArrayList<>();
    }

    public List<Album> getChildren() {
        return children;
    }

    public void setChildren(List<Album> children) {
        this.children = children;
    }

    public String addTrack(Track track) {
        String albumID = track.getAlbumID();
        boolean foundAlbum = false;
        for (Album album : children) {
            if (album.getAlbumID().equals(albumID)) {
                foundAlbum = true;
                album.addTrack(track);
                break;
            }
        }
        if (!foundAlbum) {
            albumID = getAlbumID(track);
            track.setAlbumID(albumID);
            Album album = new Album();
            album.setAlbumID(albumID);
            album.setName(track.getAlbumName());
            album.setYear(track.getYear());
            album.addTrack(track);
            children.add(album);
        }
        return albumID;
    }

    public static String getAlbumID(Track track) {
        String albumName = track.getAlbumName();
        boolean hasAlbumName = !StringUtils.isEmpty(albumName);
        return String.format("%s_%d",
                hasAlbumName ? albumName : track.getArtist(),
                hasAlbumName ? track.getYear() : 1000);
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;

        LibraryByAlbum that = (LibraryByAlbum) o;

        if (children != null ? !children.equals(that.children) : that.children != null) return false;

        return true;
    }

    @Override
    public int hashCode() {
        return children != null ? children.hashCode() : 0;
    }
}
