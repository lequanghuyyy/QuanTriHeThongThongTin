package com.hmkeyewear.security.oauth2;

import com.hmkeyewear.entity.User;
import com.hmkeyewear.enums.Provider;
import com.hmkeyewear.enums.Role;
import com.hmkeyewear.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.oauth2.client.userinfo.DefaultOAuth2UserService;
import org.springframework.security.oauth2.client.userinfo.OAuth2UserRequest;
import org.springframework.security.oauth2.core.OAuth2AuthenticationException;
import org.springframework.security.oauth2.core.user.DefaultOAuth2User;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.stereotype.Service;

import java.util.Map;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class CustomOAuth2UserService extends DefaultOAuth2UserService {

    private final UserRepository userRepository;

    @Override
    public OAuth2User loadUser(OAuth2UserRequest userRequest) throws OAuth2AuthenticationException {
        OAuth2User oAuth2User = super.loadUser(userRequest);
        
        Map<String, Object> attributes = oAuth2User.getAttributes();
        String email = (String) attributes.get("email");
        String name = (String) attributes.get("name");
        String picture = (String) attributes.get("picture");
        String sub = (String) attributes.get("sub");
        
        Optional<User> userOptional = userRepository.findByEmail(email);
        User user;
        if (userOptional.isPresent()) {
            user = userOptional.get();
            if (user.getProvider() != Provider.GOOGLE) {
                // user registered locally but logging in with google? can update or just return
            }
        } else {
            user = User.builder()
                    .email(email)
                    .fullName(name)
                    .avatar(picture)
                    .provider(Provider.GOOGLE)
                    .providerId(sub)
                    .role(Role.CUSTOMER)
                    .isActive(true)
                    .isEmailVerified(true) // Google emails are considered verified
                    .build();
            userRepository.save(user);
        }

        return new DefaultOAuth2User(
                oAuth2User.getAuthorities(),
                attributes,
                "email"
        );
    }
}
