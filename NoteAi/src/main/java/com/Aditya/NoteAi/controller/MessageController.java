package com.Aditya.NoteAi.controller;
import com.Aditya.NoteAi.dto.NoteBody;
import com.Aditya.NoteAi.dto.AISummaryRequest;
import com.Aditya.NoteAi.entity.User;
import com.Aditya.NoteAi.repository.UserRepository;
import com.Aditya.NoteAi.service.NoteService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/note")
public class MessageController {

    private final NoteService noteService;
    private final UserRepository userRepository;

    public MessageController(
            NoteService noteService,
            UserRepository userRepository) {

        this.noteService = noteService;
        this.userRepository = userRepository;
    }

    private UUID getAuthenticatedUserId(Authentication authentication) {

        String username = authentication.getName();

        User user = userRepository.findByUsername(username)
                .orElseThrow(() ->
                        new RuntimeException("Authenticated user not found"));

        return user.getId();
    }

    @GetMapping("/get")
    public ResponseEntity<?> getNotes(Authentication authentication) {

        try {
            UUID userId = getAuthenticatedUserId(authentication);

            return ResponseEntity.ok(
                    noteService.getNotes(userId)
            );

        } catch (Exception e) {

            return ResponseEntity.status(HttpStatus.BAD_GATEWAY)
                    .body("Flask error: " + e.getMessage());
        }
    }

    @PostMapping("/send")
    public ResponseEntity<?> send(
            @RequestBody NoteBody noteBody,
            Authentication authentication) {

        try {
            UUID userId = getAuthenticatedUserId(authentication);

            return ResponseEntity.ok(
                    noteService.addNote(noteBody, userId)
            );

        } catch (Exception e) {

            return ResponseEntity.status(HttpStatus.BAD_GATEWAY)
                    .body("Flask error: " + e.getMessage());
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> update(
            @PathVariable Long id,
            @RequestBody NoteBody noteBody,
            Authentication authentication) {

        try {
            UUID userId = getAuthenticatedUserId(authentication);

            return ResponseEntity.ok(
                    noteService.updateNote(id, noteBody, userId)
            );

        } catch (Exception e) {

            return ResponseEntity.status(HttpStatus.BAD_GATEWAY)
                    .body("Flask error: " + e.getMessage());
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> delete(
            @PathVariable Long id,
            Authentication authentication) {

        try {
            UUID userId = getAuthenticatedUserId(authentication);

            noteService.deleteNote(id, userId);

            return ResponseEntity.ok(
                    Map.of("success", true)
            );

        } catch (Exception e) {

            return ResponseEntity.status(HttpStatus.BAD_GATEWAY)
                    .body("Flask error: " + e.getMessage());
        }
    }
    @PostMapping("/ai/summary")
    public ResponseEntity<?> generateAISummary(
            @RequestBody AISummaryRequest request,
            Authentication authentication) {
        try {
            UUID userId = getAuthenticatedUserId(authentication);
            return ResponseEntity.ok(
                    noteService.generateAISummary(
                            request.getCategory(),
                            userId
                    )
            );
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_GATEWAY)
                    .body("Flask AI error: " + e.getMessage());
        }
    }
}