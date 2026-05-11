package fatec.flowsense.backend.controller;

import java.time.Instant;

import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.oauth2.jwt.JwtClaimsSet;
import org.springframework.security.oauth2.jwt.JwtEncoder;
import org.springframework.security.oauth2.jwt.JwtEncoderParameters;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;

import fatec.flowsense.backend.controller.dto.LoginRequest;
import fatec.flowsense.backend.controller.dto.LoginResponse;
import fatec.flowsense.backend.repository.UserRepository;

@RestController
public class TokenController {

    private final JwtEncoder jwtEncoder;
    private final UserRepository userRepository;
    private final BCryptPasswordEncoder bCryptPasswordEncoder;

    public TokenController(
            JwtEncoder jwtEncoder,
            UserRepository userRepository,
            BCryptPasswordEncoder bCryptPasswordEncoder
    ) {
        this.jwtEncoder = jwtEncoder;
        this.userRepository = userRepository;
        this.bCryptPasswordEncoder = bCryptPasswordEncoder;
    }

    @PostMapping("/login")
    public ResponseEntity<LoginResponse> login(
            @RequestBody LoginRequest loginRequest
    ) {

        var userOptional = userRepository.findByEmail(loginRequest.email());

        System.out.println("====================================");
        System.out.println("EMAIL RECEBIDO: " + loginRequest.email());

        if (userOptional.isEmpty()) {
            System.out.println("USUARIO NÃO ENCONTRADO");

            throw new BadCredentialsException(
                    "Email ou senha inválidos"
            );
        }

        var user = userOptional.get();

        System.out.println("USUARIO ENCONTRADO");
        System.out.println("SENHA DIGITADA: " + loginRequest.password());
        System.out.println("HASH NO BANCO: " + user.getPassword());

        boolean passwordMatches = bCryptPasswordEncoder.matches(
                loginRequest.password(),
                user.getPassword()
        );

        System.out.println("PASSWORD MATCHES: " + passwordMatches);

        if (!passwordMatches) {

            throw new BadCredentialsException(
                    "Email ou senha inválidos"
            );
        }

        var now = Instant.now();

        long expiresIn = 3600L;

        String username = user.getUsername() != null
                ? user.getUsername()
                : "";

        var claims = JwtClaimsSet.builder()
                .issuer("BackendFlow")
                .subject(user.getUserId().toString())
                .claim("email", user.getEmail())
                .claim("username", username)
                .issuedAt(now)
                .expiresAt(now.plusSeconds(expiresIn))
                .build();

        System.out.println("GERANDO JWT...");

        var jwtValue = jwtEncoder.encode(
                JwtEncoderParameters.from(claims)
        ).getTokenValue();

        System.out.println("JWT GERADO COM SUCESSO");

        LoginResponse response = new LoginResponse(
                jwtValue,
                user.getUserId().toString(),
                user.getEmail()
        );

        return ResponseEntity.ok(response);
    }

    @PostMapping("/logout")
    public ResponseEntity<Void> logout() {

        return ResponseEntity.ok().build();
    }
}