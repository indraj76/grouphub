package com.grouphub.verification;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import java.io.IOException;
import java.net.URI;
import java.net.URLEncoder;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.nio.charset.StandardCharsets;
import java.time.Duration;
import java.util.Optional;

/** Reads public group info from the Telegram Bot API. The bot token never leaves the server. */
@Component
public class TelegramClient {

    public record ChatInfo(String type, String title, String description, Integer memberCount) {}

    private final HttpClient http = HttpClient.newBuilder().connectTimeout(Duration.ofSeconds(5)).build();
    private final ObjectMapper mapper = new ObjectMapper();
    private final String botToken;

    public TelegramClient(@Value("${telegram.bot-token:}") String botToken) {
        this.botToken = botToken;
    }

    /** Empty if the username doesn't exist or isn't a group/supergroup/channel. */
    public Optional<ChatInfo> lookup(String username) {
        if (botToken == null || botToken.isBlank()) {
            throw new IllegalStateException("Telegram bot token is not configured on the server");
        }
        JsonNode chat = call("getChat", username);
        if (chat == null) return Optional.empty();

        String type = chat.path("type").asText("");
        if (!type.equals("group") && !type.equals("supergroup") && !type.equals("channel")) {
            return Optional.empty();
        }
        JsonNode count = call("getChatMemberCount", username);
        Integer members = (count != null && count.isNumber()) ? count.asInt() : null;

        return Optional.of(new ChatInfo(
                type, chat.path("title").asText(""), chat.path("description").asText(""), members));
    }

    private JsonNode call(String method, String username) {
        try {
            String query = "chat_id=" + URLEncoder.encode("@" + username, StandardCharsets.UTF_8);
            HttpRequest req = HttpRequest.newBuilder(
                            URI.create("https://api.telegram.org/bot" + botToken + "/" + method + "?" + query))
                    .timeout(Duration.ofSeconds(8)).GET().build();
            HttpResponse<String> res = http.send(req, HttpResponse.BodyHandlers.ofString());
            JsonNode root = mapper.readTree(res.body());
            return root.path("ok").asBoolean(false) ? root.path("result") : null;
        } catch (IOException e) {
            // deliberately no cause/log: the request URL contains the bot token
            throw new IllegalStateException("Could not reach Telegram, please try again");
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
            throw new IllegalStateException("Request interrupted");
        }
    }
}
