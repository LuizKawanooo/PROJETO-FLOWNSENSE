package fatec.flowsense.backend.controller;

import java.util.Date;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Controller;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.ResponseBody;
import org.springframework.web.server.ResponseStatusException;
import org.springframework.security.jwt.JwtHelper;
import org.springframework.security.oauth2.common.util.JsonParseException;

import com.fasterxml.jackson.databind.ObjectMapper;

import fatec.flowsense.backend.controller.dto.CreateUserDto;
import fatec.flowsense.backend.controller.dto.LoginRequest;
import fatec.flowsense.backend.controller.dto.LoginResponse;
import fatec.flowsense.backend.entities.User;
import fatec.flowsense.backend.repository.UserRepository;

@Controller
public class AuthController {

	private final UserRepository userRepository;
	private final BCryptPasswordEncoder bCryptPasswordEncoder;
	private final JwtTokenProvider jwtTokenProvider;

	public AuthController(UserRepository userRepository, BCryptPasswordEncoder bCryptPasswordEncoder,
			JwtTokenProvider jwtTokenProvider) {
		this.userRepository = userRepository;
		this.bCryptPasswordEncoder = bCryptPasswordEncoder;
		this.jwtTokenProvider = jwtTokenProvider;
	}

	@ResponseBody
	@PostMapping("/login")
	@Transactional(readOnly = true)
	public ResponseEntity<LoginResponse> login(@RequestBody LoginRequest request) {
		
		// IMPORTANTE: Buscar SEMPRE pelo email do request (pode ter sido alterado)
		var userOptional = userRepository.findByEmail(request.email());
		
		if (userOptional.isEmpty()) {
			throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Email ou senha inválidos");
		}

		var user = userOptional.get();

		// Verificar senha
		if (!bCryptPasswordEncoder.matches(request.password(), user.getPassword())) {
			throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Email ou senha inválidos");
		}

		// Gerar token JWT
		String token = jwtTokenProvider.generateToken(user.getUserId().toString(), user.getEmail());
		
		System.out.println("===== LOGIN BEM SUCEDIDO =======================================");
		System.out.println("Email: " + user.getEmail());
		System.out.println("UserId: " + user.getUserId());

		return ResponseEntity.ok(new LoginResponse(token, user.getUserId().toString(), user.getEmail()));
	}

	@ResponseBody
	@PostMapping("/logout")
	public ResponseEntity<Void> logout() {
		// O logout é feito no frontend removendo o token
		return ResponseEntity.ok().build();
	}
}
