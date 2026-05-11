package fatec.flowsense.backend.entities;

import java.time.LocalDateTime;
import java.util.Set;
import java.util.UUID;

import org.springframework.security.crypto.password.PasswordEncoder;

import fatec.flowsense.backend.controller.dto.LoginRequest;
import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinTable;
import jakarta.persistence.ManyToMany;
import jakarta.persistence.Table;
import jakarta.persistence.JoinColumn;

@Entity
@Table(name = "tb_users")
public class User {
	@Id
	@GeneratedValue(strategy = GenerationType.UUID)
	@Column(name = "user_id")
	private UUID userId;	

	@Column(unique = true, nullable = false)
	private String email;

	@Column(nullable = false)
	private String password;
	
    @Column
    private String username;
    
    private String resetToken;
    private LocalDateTime resetTokenExpiry;

	@ManyToMany(cascade = CascadeType.ALL, fetch = FetchType.EAGER)
	@JoinTable(name = "tb_users_roles", joinColumns = @JoinColumn(name = "user_id"), inverseJoinColumns = @JoinColumn(name = "role_id"))
	private Set<Role> roles;

	public UUID getUserId() {
		return userId;
	}

	public void setUserId(UUID userId) {
		this.userId = userId;
	}

	public String getEmail() {
		return email;
	}

	public void setEmail(String email) {
		this.email = email;
	}

	public String getPassword() {
		return password;
	}

	public void setPassword(String password) {
		this.password = password;
	}

	public Set<Role> getRoles() {
		return roles;
	}

	public void setRoles(Set<Role> roles) {
		this.roles = roles;
	}

	public String getUsername() {
		return username;
	}

	public void setUsername(String username) {
		this.username = username;
	}
	
	
	public String getResetToken() {
	    return resetToken;
	}

	public void setResetToken(String resetToken) {
	    this.resetToken = resetToken;
	}

	public LocalDateTime getResetTokenExpiry() {
	    return resetTokenExpiry;
	}

	public void setResetTokenExpiry(
	        LocalDateTime resetTokenExpiry) {

	    this.resetTokenExpiry = resetTokenExpiry;
	}

	public enum Values {

		BASIC(1L), ADMIN(2L);

		long roleId;

		Values(long roleId) {
			this.roleId = roleId;
		}

		public long getRoleId() {
			return roleId;
		}

	}

	public boolean isLoginCorrect(LoginRequest loginRequest, PasswordEncoder passwordEncoder) {
		return passwordEncoder.matches(loginRequest.password(), this.password);
	}
}