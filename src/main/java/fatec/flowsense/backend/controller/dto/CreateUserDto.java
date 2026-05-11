package fatec.flowsense.backend.controller.dto;

public record CreateUserDto(
        String email,
        String password,
        String username
) {
}