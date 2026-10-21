package com.Aditya.NoteAi.service;

import com.Aditya.NoteAi.dto.NoteBody;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;

import java.util.HashMap;
import java.util.Map;
import java.util.UUID;

@Service
public class NoteService {

    private final RestClient restClient;

    @Value("${flask.base-url}")
    private String flaskBaseUrl;

    public NoteService(RestClient restClient) {
        this.restClient = restClient;
    }

    public Object getNotes(UUID userId) {

        return restClient.get()
                .uri(flaskBaseUrl + "/notes")
                .header("X-User-Id", userId.toString())
                .retrieve()
                .body(Object.class);
    }

    public Object addNote(NoteBody noteBody, UUID userId) {

        return restClient.post()
                .uri(flaskBaseUrl + "/notes")
                .header("X-User-Id", userId.toString())
                .body(noteBody)
                .retrieve()
                .body(Object.class);
    }

    public Object updateNote(
            Long id,
            NoteBody noteBody,
            UUID userId) {

        return restClient.put()
                .uri(flaskBaseUrl + "/notes/" + id)
                .header("X-User-Id", userId.toString())
                .body(noteBody)
                .retrieve()
                .body(Object.class);
    }

    public void deleteNote(Long id, UUID userId) {

        restClient.delete()
                .uri(flaskBaseUrl + "/notes/" + id)
                .header("X-User-Id", userId.toString())
                .retrieve()
                .toBodilessEntity();
    }
    public Object generateAISummary(
            String category,
            UUID userId) {

        Map<String, Object> requestBody = new HashMap<>();
        requestBody.put("category", category);

        return restClient.post()
                .uri(flaskBaseUrl + "/ai/summary")
                .header("X-User-Id", userId.toString())
                .body(requestBody)
                .retrieve()
                .body(Object.class);
    }
}