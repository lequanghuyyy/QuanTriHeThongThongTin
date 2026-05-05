package com.hmkeyewear.controller;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestParam;

@Controller
public class OAuth2RedirectController {

    @Value("${app.oauth2.frontend-redirect-url:http://localhost:5174/oauth2/redirect}")
    private String frontendRedirectUrl;

    @GetMapping("/oauth2/redirect")
    public String redirectToFrontend(
            @RequestParam String accessToken,
            @RequestParam String refreshToken) {
        
        // Extract base URL without the path
        String frontendBaseUrl = frontendRedirectUrl.substring(0, frontendRedirectUrl.lastIndexOf("/oauth2/redirect"));
        
        // Return HTML with JavaScript redirect
        return """
                <!DOCTYPE html>
                <html>
                <head>
                    <title>Redirecting...</title>
                </head>
                <body>
                    <div style="text-align: center; padding: 50px; font-family: Arial, sans-serif;">
                        <h2>Đang đăng nhập...</h2>
                        <p>Vui lòng đợi trong giây lát.</p>
                    </div>
                    <script>
                        window.location.href = '%s/oauth2/redirect?accessToken=%s&refreshToken=%s';
                    </script>
                </body>
                </html>
                """.formatted(frontendBaseUrl, accessToken, refreshToken);
    }
}
