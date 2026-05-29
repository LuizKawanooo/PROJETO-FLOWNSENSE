# 🔴 SOLUÇÃO PARA ERRO 401 NO LOGIN

## O Problema
O erro `401 Unauthorized` no `/login` significa que:
1. ❌ O endpoint `/login` retorna 401 ao invés de 200
2. ❌ Pode estar exigindo autenticação JWT antes de fazer login
3. ❌ O AuthController pode não estar implementado ainda

## ✅ SOLUÇÃO PARTE 1: BACKEND JAVA

### 1. Configure Spring Security para Permitir /login (PÚBLICA)

**Arquivo: SecurityConfiguration.java** (ou sua classe de configuração de segurança)

```java
package fatec.flowsense.backend.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configuration.WebSecurityConfigurerAdapter;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

@Configuration
@EnableWebSecurity
public class SecurityConfiguration extends WebSecurityConfigurerAdapter {

    @Override
    protected void configure(HttpSecurity http) throws Exception {
        http
            .cors().and()
            .csrf().disable()
            .authorizeRequests()
                // ✅ ENDPOINTS PÚBLICOS (sem autenticação)
                .antMatchers("/login").permitAll()
                .antMatchers("/logout").permitAll()
                .antMatchers("/users").permitAll()  // signup
                
                // 🔒 ENDPOINTS PROTEGIDOS (com autenticação)
                .antMatchers("/users/**").authenticated()
                
                .anyRequest().permitAll()
            .and()
            .httpBasic();
    }

    @Bean
    public BCryptPasswordEncoder bCryptPasswordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();
        configuration.setAllowedOrigins(java.util.Arrays.asList("*"));
        configuration.setAllowedMethods(java.util.Arrays.asList("GET", "POST", "PUT", "DELETE", "OPTIONS"));
        configuration.setAllowedHeaders(java.util.Arrays.asList("*"));
        configuration.setAllowCredentials(false);
        
        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);
        return source;
    }
}
```

### 2. Implemente o AuthController (já fornecido antes)

```java
package fatec.flowsense.backend.controller;

import java.util.Date;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.ResponseBody;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;

import fatec.flowsense.backend.controller.dto.LoginRequest;
import fatec.flowsense.backend.controller.dto.LoginResponse;
import fatec.flowsense.backend.repository.UserRepository;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import io.jsonwebtoken.security.Keys;

@RestController  // ← IMPORTANTE: USE @RestController AO INVÉS DE @Controller
public class AuthController {

    private final UserRepository userRepository;
    private final BCryptPasswordEncoder bCryptPasswordEncoder;

    public AuthController(UserRepository userRepository, BCryptPasswordEncoder bCryptPasswordEncoder) {
        this.userRepository = userRepository;
        this.bCryptPasswordEncoder = bCryptPasswordEncoder;
    }

    @ResponseBody
    @PostMapping("/login")
    public ResponseEntity<LoginResponse> login(@RequestBody LoginRequest request) {
        System.out.println("===== RECEBIDO LOGIN REQUEST =====");
        System.out.println("Email: " + request.email());
        System.out.println("Password (encrypted): " + request.password());
        
        // IMPORTANTE: Buscar SEMPRE pelo email do request
        var userOptional = userRepository.findByEmail(request.email());
        
        if (userOptional.isEmpty()) {
            System.out.println("❌ Usuário não encontrado: " + request.email());
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Email ou senha inválidos");
        }

        var user = userOptional.get();
        System.out.println("✅ Usuário encontrado: " + user.getUserId());

        // Verificar senha
        if (!bCryptPasswordEncoder.matches(request.password(), user.getPassword())) {
            System.out.println("❌ Senha incorreta");
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Email ou senha inválidos");
        }

        System.out.println("✅ Senha correta");

        // Gerar token JWT
        String token = generateToken(user.getUserId().toString(), user.getEmail());
        
        System.out.println("✅ Token gerado: " + token.substring(0, 20) + "...");
        System.out.println("===== LOGIN BEM SUCEDIDO =======================================");

        return ResponseEntity.ok(new LoginResponse(token, user.getUserId().toString(), user.getEmail()));
    }

    @ResponseBody
    @PostMapping("/logout")
    public ResponseEntity<Void> logout() {
        System.out.println("===== LOGOUT REQUEST =====");
        return ResponseEntity.ok().build();
    }

    private String generateToken(String userId, String email) {
        String secretKey = System.getenv("JWT_SECRET") != null 
            ? System.getenv("JWT_SECRET") 
            : "sua-chave-secreta-super-segura-aqui-com-pelo-menos-256-bits";
        
        return Jwts.builder()
                .setSubject(userId)
                .claim("email", email)
                .setIssuedAt(new Date())
                .setExpiration(new Date(System.currentTimeMillis() + 24 * 60 * 60 * 1000))
                .signWith(Keys.hmacShaKeyFor(secretKey.getBytes()), SignatureAlgorithm.HS512)
                .compact();
    }
}
```

### 3. Crie os DTOs (LoginRequest e LoginResponse)

```java
package fatec.flowsense.backend.controller.dto;

public record LoginRequest(String email, String password) {
}
```

```java
package fatec.flowsense.backend.controller.dto;

public record LoginResponse(String accessToken, String userId, String email) {
}
```

### 4. Adicione as Dependências no pom.xml

```xml
<!-- JWT -->
<dependency>
    <groupId>io.jsonwebtoken</groupId>
    <artifactId>jjwt-api</artifactId>
    <version>0.12.3</version>
</dependency>
<dependency>
    <groupId>io.jsonwebtoken</groupId>
    <artifactId>jjwt-impl</artifactId>
    <version>0.12.3</version>
    <scope>runtime</scope>
</dependency>
<dependency>
    <groupId>io.jsonwebtoken</groupId>
    <artifactId>jjwt-jackson</artifactId>
    <version>0.12.3</version>
    <scope>runtime</scope>
</dependency>

<!-- Spring Security (se não tiver) -->
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-security</artifactId>
</dependency>
```

## ✅ SOLUÇÃO PARTE 2: FRONTEND - Melhorar Logs de Debug

O frontend já está tratando 401, mas vamos melhorar os logs para debug:
