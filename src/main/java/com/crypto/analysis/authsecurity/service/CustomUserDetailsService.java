package com.crypto.analysis.authsecurity.service;

import java.util.ArrayList;
import java.util.Collection;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

import com.crypto.analysis.authsecurity.domain.Privilege;
import com.crypto.analysis.authsecurity.domain.Role;
import com.crypto.analysis.authsecurity.domain.User;
import com.crypto.analysis.authsecurity.repositories.UserRepository;
import com.crypto.analysis.authsecurity.dto.CustomuserdetailsDTO;


@Service
public class CustomUserDetailsService implements UserDetailsService {

    private UserRepository userRepository;
    private final Map<String, CustomuserdetailsDTO> userRegistry = new HashMap<>();

    public CustomUserDetailsService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }
    
    @Override
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
       User user = userRepository.findByUsername(username)
               .orElseThrow(() ->
                       new UsernameNotFoundException("User not found with username :" + username));
     
       return new CustomuserdetailsDTO.Builder().withFirstName(user.getFirstName())
  	          .withLastName(user.getSurName())
  	          .withEmail(user.getEmail())
  	          .withUsername(user.getUsername())
  	          .withPassword(user.getPassword())
  	          .withTacAccepted(user.getTacAccepted())
  	          .withAuthorities(mapRolesToAuthorities(user.getRoles()))
  	          .build();
       /* return new org.springframework.security.core.userdetails.User(user.getUsername(),
                user.getPassword(), mapRolesToAuthorities(user.getRoles()));*/
    }
    private Collection<? extends GrantedAuthority> mapRolesToAuthorities(final Collection<Role> roles) {
        return getGrantedAuthorities(getPrivileges(roles));
    }
    private List<String> getPrivileges(final Collection<Role> roles) {
        final List<String> privileges = new ArrayList<>();
        final List<Privilege> collection = new ArrayList<>();
        for (final Role role : roles) {
            privileges.add(role.getName());
            collection.addAll(role.getPrivileges());
        }
        for (final Privilege item : collection) {
            privileges.add(item.getName());
        }

        return privileges;
    }
    private List<GrantedAuthority> getGrantedAuthorities(final List<String> privileges) {
        final List<GrantedAuthority> authorities = new ArrayList<>();
        for (final String privilege : privileges) {
            authorities.add(new SimpleGrantedAuthority(privilege));
        }
        return authorities;
    }
}