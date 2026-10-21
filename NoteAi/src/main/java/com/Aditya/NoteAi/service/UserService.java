package com.Aditya.NoteAi.service;
import java.time.LocalDateTime;
import java.util.*;

import org.springframework.stereotype.Service;
import com.Aditya.NoteAi.entity.User;
import com.Aditya.NoteAi.dto.LoginRequest;
import com.Aditya.NoteAi.dto.RegisterRequest;
import com.Aditya.NoteAi.repository.UserRepository;

@Service
public class UserService {
    private final UserRepository userRepository;
    public UserService(UserRepository UserRepository){
        this.userRepository=UserRepository;
    }

    public void register(RegisterRequest req){
        if(userRepository.existsByUsername(req.getUsername())||userRepository.existsByEmail(req.getEmail())){
            throw new RuntimeException("Username or Email already exists");
        }
        User user=new User();
        user.setUsername(req.getUsername());
        user.setEmail(req.getEmail());
        user.setPassword((req.getPassword()));
        user.setCreatedAt(LocalDateTime.now());
        userRepository.save(user);
    }

    public User login(LoginRequest req) {
        Optional<User> user = userRepository.findByUsernameOrEmail(
                req.getIdentifier(),
                req.getIdentifier()
        );
        if (user.isEmpty()) {
            throw new RuntimeException("User doesn't exist");
        }
        if (!user.get().getPassword().equals(req.getPassword())) {
            throw new RuntimeException("Wrong Password!");
        }
        return user.get();
    }
}