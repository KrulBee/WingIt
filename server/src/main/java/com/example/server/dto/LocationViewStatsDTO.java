package com.example.server.dto;

public class LocationViewStatsDTO {
    private Integer locationId;
    private String locationName;
    private Long viewCount;
    private Long uniqueViewers;

    public LocationViewStatsDTO() {}

    public LocationViewStatsDTO(Integer locationId, String locationName, Long viewCount, Long uniqueViewers) {
        this.locationId = locationId;
        this.locationName = locationName;
        this.viewCount = viewCount;
        this.uniqueViewers = uniqueViewers;
    }

    // Getters and setters
    public Integer getLocationId() { 
        return locationId; 
    }
    
    public void setLocationId(Integer locationId) { 
        this.locationId = locationId; 
    }

    public String getLocationName() { 
        return locationName; 
    }
    
    public void setLocationName(String locationName) { 
        this.locationName = locationName; 
    }

    public Long getViewCount() { 
        return viewCount; 
    }
    
    public void setViewCount(Long viewCount) { 
        this.viewCount = viewCount; 
    }

    public Long getUniqueViewers() { 
        return uniqueViewers; 
    }
    
    public void setUniqueViewers(Long uniqueViewers) { 
        this.uniqueViewers = uniqueViewers; 
    }
}
