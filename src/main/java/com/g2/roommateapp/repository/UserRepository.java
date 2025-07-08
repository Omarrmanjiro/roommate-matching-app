package com.g2.roommateapp.repository;

import com.g2.roommateapp.entity.User;
import jakarta.validation.constraints.Email;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User,Long> {
    @Query ("SELECT u FROM User u WHERE u.id<> :id")
    List<User> findAllExcept(@Param("id") Long id) ;


    Optional<User> findByEmail(String email);

    boolean existsByEmail(@Email(message = "Email should be valid") String email);

}
