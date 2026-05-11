package fatec.flowsense.backend.controller;

import fatec.flowsense.backend.data.ResetPasswordData;
import fatec.flowsense.backend.entities.User;
import fatec.flowsense.backend.repository.UserRepository;

import java.time.LocalDateTime;
import java.util.Optional;
import java.util.UUID;

import jakarta.mail.internet.MimeMessage;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/password")
@CrossOrigin("*")
public class PasswordResetController {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private JavaMailSender mailSender;

    private BCryptPasswordEncoder passwordEncoder =
            new BCryptPasswordEncoder();

    @PostMapping("/forgot")
    public ResponseEntity<?> forgotPassword(
            @RequestBody ResetPasswordData data) {

        try {

            String email = data.getEmail();

            Optional<User> optionalUser =
                    userRepository.findByEmail(email);

            if (optionalUser.isEmpty()) {

                return ResponseEntity
                        .badRequest()
                        .body("Usuário não encontrado.");
            }

            User user = optionalUser.get();

            String token =
                    UUID.randomUUID().toString();

            user.setResetToken(token);

            user.setResetTokenExpiry(
                    LocalDateTime.now().plusMinutes(30)
            );

            userRepository.save(user);

         // Este é o link que vai no botão do e-mail
            String resetLink = "https://nonlyrically-collocative-humberto.ngrok-free.dev/api/password/redirect?token=" + token;

            // o deepLink é o seu "esquema" do APK
            String deepLink = "flowsense://reset-password?token=" + token;

            MimeMessage message =
                    mailSender.createMimeMessage();

            MimeMessageHelper helper =
                    new MimeMessageHelper(
                            message,
                            true,
                            "UTF-8"
                    );

            String html = """
<!DOCTYPE html>
<html lang="pt-br">

<head>
<meta charset="UTF-8">

<style>

body{
    margin:0;
    padding:0;
    background:#0f5be7;
    font-family:Arial,sans-serif;
}

.container{
    width:100%%;
    padding:40px 0;
}

.card{
    max-width:500px;
    margin:auto;
    background:#1565ff;
    border-radius:20px;
    padding:40px;
    text-align:center;
    color:white;
    box-shadow:0 10px 30px rgba(0,0,0,0.2);
}

.logo{
    font-size:34px;
    font-weight:bold;
    margin-bottom:20px;
}

.title{
    font-size:26px;
    font-weight:bold;
    margin-bottom:15px;
}

.text{
    font-size:16px;
    line-height:1.6;
    margin-bottom:30px;
}

.button{
    display:inline-block;
    background:white;
    color:#1565ff !important;
    text-decoration:none;
    padding:16px 40px;
    border-radius:12px;
    font-weight:bold;
    font-size:16px;
}

.link-box{
    margin-top:30px;
    background:rgba(255,255,255,0.12);
    padding:15px;
    border-radius:12px;
    word-break:break-all;
    font-size:14px;
    line-height:1.5;
}

.footer{
    margin-top:25px;
    font-size:13px;
    opacity:0.8;
}

.copy-title{
    font-weight:bold;
    margin-bottom:10px;
}

.deep-link{
    margin-top:20px;
    font-size:13px;
    opacity:0.9;
    word-break:break-all;
}

</style>
</head>

<body>

<div class="container">

<div class="card">

<div class="logo">
FlowSense
</div>

<div class="title">
Recuperação de Senha
</div>

<div class="text">
Recebemos uma solicitação para redefinir sua senha.
Clique no botão abaixo para continuar.
</div>

<a class="button" href="%s">
Redefinir Senha
</a>

<div class="link-box">

<div class="copy-title">
Caso o botão não funcione:
</div>

Copie o link abaixo no navegador:

<br><br>

%s

<div class="deep-link">

Ou copie este link direto no aplicativo:

<br><br>

%s

</div>

</div>

<div class="footer">
Este link expira em 30 minutos.
</div>

</div>

</div>

</body>
</html>
""".formatted(
                    resetLink,
                    resetLink,
                    deepLink
            );

            helper.setFrom("SEUEMAIL@gmail.com");

            helper.setTo(email);

            helper.setSubject(
                    "Recuperação de senha - FlowSense"
            );

            helper.setText(html, true);

            mailSender.send(message);

            return ResponseEntity.ok(
                    "Email de recuperação enviado."
            );

        } catch (Exception e) {

            e.printStackTrace();

            return ResponseEntity
                    .status(HttpStatus.BAD_REQUEST)
                    .body(e.getMessage());
        }
    }
    
    
    
    @GetMapping("/redirect")
    public ResponseEntity<String> redirect(@RequestParam("token") String token) {
        // O protocolo 'flowsense://' aciona o seu appId 'fatec.flowsense.app'
        String appLink = "flowsense://reset-password?token=" + token;

        String html = """
            <html>
            <head>
                <script>
                    // Tenta abrir o app imediatamente
                    window.location.href = "%s";
                    
                    // Se o usuário ainda estiver na página após 2 segundos, 
                    // talvez ele não tenha o app instalado
                    setTimeout(function() {
                        alert("Se o aplicativo não abriu, verifique se ele está instalado.");
                    }, 2000);
                </script>
            </head>
            <body>
                <p>Abrindo o FlowSense...</p>
                <a href="%s">Clique aqui se não for redirecionado automaticamente</a>
            </body>
            </html>
            """.formatted(appLink, appLink);

        return ResponseEntity.ok()
                .contentType(org.springframework.http.MediaType.TEXT_HTML)
                .body(html);
    }
    
    
    

    @PostMapping("/reset")
    public ResponseEntity<?> resetPassword(
            @RequestBody ResetPasswordData data) {

        try {

            if (!data.getPassword()
                    .equals(data.getRepeatPassword())) {

                return ResponseEntity
                        .badRequest()
                        .body("As senhas não coincidem.");
            }

            Optional<User> optionalUser =
                    userRepository.findByResetToken(
                            data.getToken()
                    );

            if (optionalUser.isEmpty()) {

                return ResponseEntity
                        .badRequest()
                        .body("Token inválido.");
            }

            User user = optionalUser.get();

            if (user.getResetTokenExpiry()
                    .isBefore(LocalDateTime.now())) {

                return ResponseEntity
                        .badRequest()
                        .body("Token expirado.");
            }

            String encryptedPassword =
                    passwordEncoder.encode(
                            data.getPassword()
                    );

            user.setPassword(encryptedPassword);

            user.setResetToken(null);

            user.setResetTokenExpiry(null);

            userRepository.save(user);

            return ResponseEntity.ok(
                    "Senha alterada com sucesso."
            );

        } catch (Exception e) {

            e.printStackTrace();

            return ResponseEntity
                    .status(HttpStatus.BAD_REQUEST)
                    .body(e.getMessage());
        }
    }
}