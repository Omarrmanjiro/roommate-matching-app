package com.g2.roommateapp.repository;

import com.g2.roommateapp.entity.UserPreferences;
import org.springframework.data.jpa.repository.JpaRepository;

public interface UserPreferencesRepository extends JpaRepository<UserPreferences, Long> {

}
