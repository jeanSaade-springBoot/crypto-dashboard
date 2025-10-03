package com.crypto.analysis.authsecurity.domain;

import java.sql.Timestamp;
import java.util.Collection;
import java.util.Set;

import javax.persistence.*;

import org.hibernate.annotations.GenericGenerator;
import org.hibernate.annotations.Parameter;

import com.fasterxml.jackson.annotation.JsonManagedReference;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor 
@AllArgsConstructor
@Entity
@Table(name = "Users", uniqueConstraints = {
        @UniqueConstraint(columnNames = {"username"}),
})
public class User {
	@Id
	@GeneratedValue(generator = "user_sequence")
	   @GenericGenerator(
	      name = "user_sequence",
	      strategy = "org.hibernate.id.enhanced.SequenceStyleGenerator",
	      parameters = {
	        @Parameter(name = "sequence_name", value = "user_sequence"),
	        @Parameter(name = "initial_value", value = "1"),
	        @Parameter(name = "increment_size", value = "1")
	        }
	    )
    private Long id;
	private String username;
    private String password;
    private String passwordHint;
    private String title;
	private String firstName;
    private String surName;
    private String phone;
    private String mobile;
    private String company;
    private String address1;
    private String address2;
    private String postCode;
    private String Country;
    private String email;
    private String status;
    private Boolean isFirstLogin;
    private Timestamp createdOn;
    private Timestamp updatedOn;
    private Timestamp lastLogin;
    private Boolean tacAccepted;

    @ManyToMany(fetch = FetchType.EAGER, cascade = CascadeType.ALL)
    @JoinTable(name = "users_roles",
        joinColumns = @JoinColumn(name = "user_id", referencedColumnName = "id"),
        inverseJoinColumns = @JoinColumn(name = "role_id", referencedColumnName = "id"))
    @JsonManagedReference
    private Collection<Role> roles;
    
    public void removeRoles( Collection<Role> role) {
    	roles.removeAll(role);
    }
}
