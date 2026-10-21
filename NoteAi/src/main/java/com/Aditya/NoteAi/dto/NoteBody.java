package com.Aditya.NoteAi.dto;

import java.time.Instant;
import java.time.LocalDateTime;
import java.util.UUID;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class NoteBody {
    private Long id;
    private String title;
    private String content;
    private String category;
    private String time;
    private String color;
}
