package fatec.flowsense.backend.controller;

import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import io.jsonwebtoken.security.Keys;
import org.springframework.stereotype.Component;

import javax.crypto.SecretKey;
import java.util.Date;

@Component
public class JwtTokenProvider {

    // IMPORTANTE: Use uma chave secreta forte em produção (variável de ambiente)
    private static final String SECRET_KEY = System.getenv("JWT_SECRET") != null 
        ? System.getenv("JWT_SECRET") 
        : "sua-chave-secreta-super-segura-aqui-com-pelo-menos-256-bits";
    
    private static final long EXPIRATION_TIME = 24 * 60 * 60 * 1000; // 24 horas

    public String generateToken(String userId, String email) {
        SecretKey key = Keys.hmacShaKeyFor(SECRET_KEY.getBytes());
        
        return Jwts.builder()
                .setSubject(userId)
                .claim("email", email)
                .setIssuedAt(new Date())
                .setExpiration(new Date(System.currentTimeMillis() + EXPIRATION_TIME))
                .signWith(key, SignatureAlgorithm.HS512)
                .compact();
    }
}
