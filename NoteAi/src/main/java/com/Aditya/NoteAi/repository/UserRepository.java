package com.Aditya.NoteAi.repository;
import java.util.*;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;
import com.Aditya.NoteAi.entity.User;

public interface UserRepository extends JpaRepository<User, UUID> {
    Optional<User> findByEmail(String email);
    boolean existsByUsername(String username);
    boolean existsByEmail(String email);
    Optional<User> findByUsername(String username);
    Optional<User> findByUsernameOrEmail(String username, String email);
    List<User> findByUsernameContainingIgnoreCase(String username);
    List<User> findByUsernameIn(List<String> usernames);
}