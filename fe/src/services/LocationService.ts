import { createAuthHeaders } from './AuthService';

export interface Location {
  id: number;
  location: string;
}

export interface LocationCreateRequest {
  location: string;
}

export interface LocationUpdateRequest {
  location: string;
}

class LocationService {
  private baseURL = 'http://localhost:8080/api/locations';

  // Get all locations
  async getAllLocations(): Promise<Location[]> {
    try {
      const response = await fetch(`${this.baseURL}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          ...createAuthHeaders(),
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch locations');
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching locations:', error);
      throw error;
    }
  }

  // Get location by ID
  async getLocationById(id: number): Promise<Location> {
    try {
      const response = await fetch(`${this.baseURL}/${id}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          ...createAuthHeaders(),
        },
      });

      if (!response.ok) {
        if (response.status === 404) {
          throw new Error('Location not found');
        }
        throw new Error('Failed to fetch location');
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching location:', error);
      throw error;
    }
  }

  // Create a new location (Admin only)
  async createLocation(location: LocationCreateRequest): Promise<Location> {
    try {
      const response = await fetch(`${this.baseURL}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...createAuthHeaders(),
        },
        body: JSON.stringify(location),
      });

      if (!response.ok) {
        throw new Error('Failed to create location');
      }

      return await response.json();
    } catch (error) {
      console.error('Error creating location:', error);
      throw error;
    }
  }

  // Update a location (Admin only)
  async updateLocation(id: number, location: LocationUpdateRequest): Promise<Location> {
    try {
      const response = await fetch(`${this.baseURL}/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...createAuthHeaders(),
        },
        body: JSON.stringify(location),
      });

      if (!response.ok) {
        if (response.status === 404) {
          throw new Error('Location not found');
        }
        throw new Error('Failed to update location');
      }

      return await response.json();
    } catch (error) {
      console.error('Error updating location:', error);
      throw error;
    }
  }

  // Delete a location (Admin only)
  async deleteLocation(id: number): Promise<void> {
    try {
      const response = await fetch(`${this.baseURL}/${id}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          ...createAuthHeaders(),
        },
      });

      if (!response.ok) {
        if (response.status === 404) {
          throw new Error('Location not found');
        }
        throw new Error('Failed to delete location');
      }
    } catch (error) {
      console.error('Error deleting location:', error);
      throw error;
    }
  }

  // Search locations by name pattern
  async searchLocations(searchPattern: string): Promise<Location[]> {
    try {
      const allLocations = await this.getAllLocations();
      return allLocations.filter(location => 
        location.location.toLowerCase().includes(searchPattern.toLowerCase())
      );
    } catch (error) {
      console.error('Error searching locations:', error);
      throw error;
    }
  }

  // Check if a location name exists
  async locationExists(locationName: string): Promise<boolean> {
    try {
      const allLocations = await this.getAllLocations();
      return allLocations.some(location => 
        location.location.toLowerCase() === locationName.toLowerCase()
      );
    } catch (error) {
      console.error('Error checking location existence:', error);
      throw error;
    }
  }

  // Get locations starting with a specific letter
  async getLocationsByLetter(letter: string): Promise<Location[]> {
    try {
      const allLocations = await this.getAllLocations();
      return allLocations.filter(location => 
        location.location.toLowerCase().startsWith(letter.toLowerCase())
      );
    } catch (error) {
      console.error('Error filtering locations by letter:', error);
      throw error;
    }
  }

  // Get popular/common locations (could be based on usage stats)
  async getPopularLocations(limit: number = 10): Promise<Location[]> {
    try {
      // For now, just return the first N locations
      // In a real implementation, this would be based on usage statistics
      const allLocations = await this.getAllLocations();
      return allLocations.slice(0, limit);
    } catch (error) {
      console.error('Error fetching popular locations:', error);
      throw error;
    }
  }

  // Get nearby locations (if GPS coordinates were available)
  async getNearbyLocations(userLocationId: number, radius: number = 50): Promise<Location[]> {
    try {
      // This is a placeholder implementation
      // In a real app, this would use GPS coordinates and calculate distances
      const allLocations = await this.getAllLocations();
      return allLocations.filter(location => location.id !== userLocationId);
    } catch (error) {
      console.error('Error fetching nearby locations:', error);
      throw error;
    }
  }

  // Format location name for display
  formatLocationName(locationName: string): string {
    return locationName
      .split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(' ');
  }

  // Get location categories (if locations were categorized)
  getLocationCategories(): string[] {
    return [
      'City',
      'Country',
      'Landmark',
      'Restaurant',
      'Shopping Mall',
      'Park',
      'Beach',
      'Mountain',
      'University',
      'Airport',
      'Hospital',
      'Hotel'
    ];
  }

  // Validate location name
  validateLocationName(locationName: string): { valid: boolean; message?: string } {
    if (!locationName || locationName.trim().length === 0) {
      return { valid: false, message: 'Location name cannot be empty' };
    }

    if (locationName.trim().length < 2) {
      return { valid: false, message: 'Location name must be at least 2 characters long' };
    }

    if (locationName.trim().length > 100) {
      return { valid: false, message: 'Location name cannot exceed 100 characters' };
    }

    // Check for valid characters (letters, spaces, hyphens, apostrophes)
    const validCharacterPattern = /^[a-zA-Z\s\-'.,()]+$/;
    if (!validCharacterPattern.test(locationName)) {
      return { valid: false, message: 'Location name contains invalid characters' };
    }

    return { valid: true };
  }
}

export default new LocationService();
