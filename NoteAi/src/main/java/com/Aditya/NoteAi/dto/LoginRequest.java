package com.Aditya.NoteAi.dto;
import lombok.Getter;
import lombok.NoArgsConstructor;


@Getter
@NoArgsConstructor
public class LoginRequest {
    private String identifier;
    private String password;
}

