package fatec.flowsense.backend.config;

import fatec.flowsense.backend.entities.Role;
import fatec.flowsense.backend.entities.User;

import java.util.Set;

import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;

import fatec.flowsense.backend.repository.RoleRepository;
import fatec.flowsense.backend.repository.UserRepository;
import jakarta.transaction.Transactional;

@Configuration
public class AdminUserConfig implements CommandLineRunner {

	private RoleRepository roleRepository;

	private UserRepository userRepository;

	private BCryptPasswordEncoder bCryptPasswordEncoder;

	public AdminUserConfig(RoleRepository roleRepository, UserRepository userRepository,
			BCryptPasswordEncoder bCryptPasswordEncoder) {
		this.roleRepository = roleRepository;
		this.userRepository = userRepository;
		this.bCryptPasswordEncoder = bCryptPasswordEncoder;
	}

	@Override
	@Transactional
	public void run(String... args) throws Exception {

		Role roleAdmin = roleRepository.findByName(Role.Values.ADMIN.name());

		if (roleAdmin == null) {
			roleAdmin = new Role();
			roleAdmin.setName(Role.Values.ADMIN.name());
			roleAdmin = roleRepository.save(roleAdmin);
		}

		final Role adminRole = roleAdmin;

		var userAdmin = userRepository.findByEmail("admin@flowsense.com");

		userAdmin.ifPresentOrElse(user -> {
			System.out.println("admin já existe");
		}, () -> {
			var user = new User();
			user.setEmail("admin@flowsense.com");
			user.setPassword(bCryptPasswordEncoder.encode("123"));
			user.setRoles(Set.of(adminRole));
			userRepository.save(user);
		});
	}

}