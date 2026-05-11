package fatec.flowsense.backend.controller;

import fatec.flowsense.backend.controller.dto.CreateUserDto;
import fatec.flowsense.backend.controller.dto.UserResponse;
import fatec.flowsense.backend.entities.Role;
import fatec.flowsense.backend.entities.User;
import fatec.flowsense.backend.repository.RoleRepository;
import fatec.flowsense.backend.repository.UserRepository;

import java.util.Set;
import java.util.UUID;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

@RestController
@RequestMapping("/users")
public class UserController {

    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final BCryptPasswordEncoder bCryptPasswordEncoder;

    public UserController(
            UserRepository userRepository,
            RoleRepository roleRepository,
            BCryptPasswordEncoder bCryptPasswordEncoder
    ) {
        this.userRepository = userRepository;
        this.roleRepository = roleRepository;
        this.bCryptPasswordEncoder = bCryptPasswordEncoder;
    }

    @PostMapping
    @Transactional
    public ResponseEntity<UserResponse> newUser(@RequestBody CreateUserDto dto) {

        var basicRole = roleRepository.findByName(Role.Values.BASIC.name());

        if (basicRole == null) {
            basicRole = new Role();
            basicRole.setName(Role.Values.BASIC.name());
            basicRole = roleRepository.save(basicRole);
        }

        var userFromDb = userRepository.findByEmail(dto.email());

        if (userFromDb.isPresent()) {
            throw new ResponseStatusException(
                    HttpStatus.UNPROCESSABLE_ENTITY,
                    "Email já cadastrado"
            );
        }

        var user = new User();

        user.setEmail(dto.email());
        user.setUsername(dto.username());
        user.setPassword(
                bCryptPasswordEncoder.encode(dto.password())
        );
        user.setRoles(Set.of(basicRole));

        userRepository.save(user);
        userRepository.flush();

        UserResponse response = new UserResponse(
                user.getUserId(),
                user.getEmail(),
                user.getUsername()
        );

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(response);
    }

    @GetMapping("/{id}")
    @Transactional(readOnly = true)
    public ResponseEntity<UserResponse> getUser(@PathVariable UUID id) {

        var user = userRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "Usuário não encontrado"
                ));

        UserResponse response = new UserResponse(
                user.getUserId(),
                user.getEmail(),
                user.getUsername()
        );

        return ResponseEntity.ok(response);
    }

    @PutMapping("/{id}")
    @Transactional
    public ResponseEntity<UserResponse> updateUser(
            @PathVariable UUID id,
            @RequestBody CreateUserDto dto
    ) {

        var user = userRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "Usuário não encontrado"
                ));

        // Valida email somente se estiver alterando
        if (dto.email() != null &&
                !dto.email().equals(user.getEmail())) {

            var emailExists = userRepository.findByEmail(dto.email());

            if (emailExists.isPresent()) {
                throw new ResponseStatusException(
                        HttpStatus.UNPROCESSABLE_ENTITY,
                        "Email já cadastrado"
                );
            }

            user.setEmail(dto.email());
        }

        // Atualiza username
        if (dto.username() != null &&
                !dto.username().isBlank()) {

            user.setUsername(dto.username());
        }

        // Atualiza senha somente se enviada
        if (dto.password() != null &&
                !dto.password().isBlank()) {

            user.setPassword(
                    bCryptPasswordEncoder.encode(dto.password())
            );
        }

        userRepository.save(user);

        // IMPORTANTE para o Ionic enxergar imediatamente
        userRepository.flush();

        UserResponse response = new UserResponse(
                user.getUserId(),
                user.getEmail(),
                user.getUsername()
        );

        return ResponseEntity.ok(response);
    }
}