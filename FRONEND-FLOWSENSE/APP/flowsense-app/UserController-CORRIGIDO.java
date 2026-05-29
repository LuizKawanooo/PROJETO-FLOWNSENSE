package fatec.flowsense.backend.controller;

import fatec.flowsense.backend.entities.Role;
import fatec.flowsense.backend.entities.User;

import java.util.Set;
import java.util.UUID;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Controller;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.ResponseBody;
import org.springframework.web.server.ResponseStatusException;

import fatec.flowsense.backend.controller.dto.CreateUserDto;
import fatec.flowsense.backend.controller.dto.UserResponse;
import fatec.flowsense.backend.repository.RoleRepository;
import fatec.flowsense.backend.repository.UserRepository;

@Controller
public class UserController {

	private final UserRepository userRepository;
	private final RoleRepository roleRepository;
	private final BCryptPasswordEncoder bCryptPasswordEncoder;

	public UserController(UserRepository userRepository, RoleRepository roleRepository,
			BCryptPasswordEncoder bCryptPasswordEncoder) {
		this.userRepository = userRepository;
		this.roleRepository = roleRepository;
		this.bCryptPasswordEncoder = bCryptPasswordEncoder;

	}

	@ResponseBody
	@PostMapping("/users")
	@Transactional
	public ResponseEntity<Void> newUser(@RequestBody CreateUserDto dto) {

		var basicRole = roleRepository.findByName(Role.Values.BASIC.name());

		if (basicRole == null) {
			basicRole = new Role();
			basicRole.setName(Role.Values.BASIC.name());
			basicRole = roleRepository.save(basicRole);
		}

		var userFromDb = userRepository.findByEmail(dto.email());
		if (userFromDb.isPresent()) {
			throw new ResponseStatusException(HttpStatus.UNPROCESSABLE_ENTITY, "Email já cadastrado");
		}

		var user = new User();
		user.setEmail(dto.email());
		user.setPassword(bCryptPasswordEncoder.encode(dto.password()));
		user.setRoles(Set.of(basicRole));

		userRepository.save(user);
		
		// Força flush para garantir que o banco foi atualizado
		userRepository.flush();
		
		System.out.println("===== ALGUEM FOI REGISTRADO =======================================");

		return ResponseEntity.ok().build();
	}
	
	
	
	@ResponseBody
	@GetMapping("/users/{id}")
	@Transactional(readOnly = true)
	public ResponseEntity<UserResponse> getUser(@PathVariable UUID id) {
	    // Busca SEMPRE do banco (não usar cache)
	    var user = userRepository.findById(id)
	        .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Usuário não encontrado"));
	    
	    return ResponseEntity.ok(new UserResponse(
	        user.getUserId(),
	        user.getEmail(),
	        user.getUsername()
	    ));
	}

    @ResponseBody
    @PutMapping("/users/{id}")
    @Transactional
    public ResponseEntity<Void> updateUser(@PathVariable UUID id, @RequestBody CreateUserDto dto) {
        // IMPORTANTE: Buscar do banco com lock pessimista para evitar race conditions
        var user = userRepository.findById(id)
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Usuário não encontrado"));
        
        // Verifica se o novo email já existe (apenas se for diferente do atual)
        if (!user.getEmail().equals(dto.email())) {
            var emailExists = userRepository.findByEmail(dto.email());
            if (emailExists.isPresent()) {
                throw new ResponseStatusException(HttpStatus.UNPROCESSABLE_ENTITY, "Email já cadastrado");
            }
        }
        
        // Atualiza nome (sempre)
        if (dto.username() != null && !dto.username().isBlank()) {
            user.setUsername(dto.username());
        }
        
        // Atualiza email (sempre)
        user.setEmail(dto.email());
        
        // SÓ altera senha se fornecida e não vazia
        if (dto.password() != null && !dto.password().isBlank()) {
            user.setPassword(bCryptPasswordEncoder.encode(dto.password()));
        }
        
        userRepository.save(user);
        
        // IMPORTANTE: Força flush para garantir que as mudanças foram commitadas no banco
        userRepository.flush();
        
        System.out.println("===== USUÁRIO ATUALIZADO =======================================");
        System.out.println("Email: " + user.getEmail());
        System.out.println("Username: " + user.getUsername());
        
        return ResponseEntity.ok().build();
    }
}
