package com.example.wingit.model.Enum;

import jakarta.persistence.*;
import lombok.Data;
public class Location {
    @Id
    private Integer id;
    private String location;
}
