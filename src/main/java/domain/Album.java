package domain;

import java.io.Serializable;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

/**
 * Created by Kaila on 11/23/2015.
 */
public class Album implements Serializable {
    private static final long serialVersionUID = 1001L;

    private String albumID;
    private String name;
    private int year;
    private List<Track> children;

    Album() {
        children = new ArrayList<>();
    }

    public String getAlbumID() {
        return albumID;
    }

    public void setAlbumID(String albumID) {
        this.albumID = albumID;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public int getYear() {
        return year;
    }

    public void setYear(int year) {
        this.year = year;
    }

    public List<Track> getChildren() {
        return children;
    }

    public void setChildren(List<Track> children) {
        this.children = children;
    }

    public void addTrack(Track track) {
        if (track.getAlbumID().equals(albumID) && !children.contains(track)) {
            children.add(track);
        }
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;

        Album album = (Album) o;

        if (year != album.year) return false;
        if (albumID != null ? !albumID.equals(album.albumID) : album.albumID != null) return false;
        if (name != null ? !name.equals(album.name) : album.name != null) return false;
        if (children != null ? !children.equals(album.children) : album.children != null) return false;

        return true;
    }

    @Override
    public int hashCode() {
        int result = albumID != null ? albumID.hashCode() : 0;
        result = 31 * result + (name != null ? name.hashCode() : 0);
        result = 31 * result + year;
        result = 31 * result + (children != null ? children.hashCode() : 0);
        return result;
    }
}
