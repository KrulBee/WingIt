package com.example.wingit.model.Entity;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

import java.util.List;

@Entity
@Table(name = "role") // Changed table name to "role"
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Role {

    @Id
    // @GeneratedValue(strategy = GenerationType.IDENTITY) // Removed GeneratedValue for predefined roles
    private Integer id;

    @Column(name = "role", nullable = false, unique = true) // Changed column name to "role"
    private String roleName; // e.g., user, admin (values from SQL)

    @OneToMany(mappedBy = "role")
    private List<User> user;
}
