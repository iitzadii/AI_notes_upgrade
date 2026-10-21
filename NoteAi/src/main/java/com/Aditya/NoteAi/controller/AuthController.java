package com.Aditya.NoteAi.controller;
import com.Aditya.NoteAi.security.JwtService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import com.Aditya.NoteAi.entity.User;
import com.Aditya.NoteAi.dto.LoginRequest;
import com.Aditya.NoteAi.dto.RegisterRequest;
import com.Aditya.NoteAi.service.UserService;

import java.util.Map;

@RestController
@RequestMapping("/auth")
public class  AuthController{
    private final JwtService jwtService;
    private final UserService userService;
    public AuthController(UserService userService,
                          JwtService jwtService) {
        this.userService = userService;
        this.jwtService = jwtService;
    }
    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody RegisterRequest request){
        try {
        userService.register(request);
        return ResponseEntity.ok("User Registered Successfully");
        } 
        catch (RuntimeException e) {
            return ResponseEntity.status(409).body(e.getMessage());
        }
    }
    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody LoginRequest request) {
        try {
            User user = userService.login(request);
            String token = jwtService.generateToken(user.getUsername());
            return ResponseEntity.ok(Map.of("token", token));
        } catch (RuntimeException e) {
            return ResponseEntity.status(409).body(e.getMessage());
        }
    }
}
