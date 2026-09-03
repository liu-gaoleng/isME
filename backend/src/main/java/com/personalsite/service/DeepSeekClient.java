package com.personalsite.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ArrayNode;
import com.fasterxml.jackson.databind.node.ObjectNode;
import com.personalsite.exception.BusinessException;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.time.Duration;
import java.util.List;

/**
 * DeepSeek API 客户端（OpenAI 兼容的 /chat/completions）。
 * 用于「思考一下」模块：生成每期的题目、评判用户的作答文档。
 * apiKey 未配置时 isAvailable() 为 false，调用方做降级处理。
 */
@Slf4j
@Service
public class DeepSeekClient {
    private final String apiKey;
    private final String baseUrl;
    private final String model;
    private final ObjectMapper objectMapper = new ObjectMapper();
    private final HttpClient httpClient = HttpClient.newBuilder()
            .connectTimeout(Duration.ofSeconds(15))
            .build();

    public DeepSeekClient(
            @Value("${app.deepseek.api-key}") String apiKey,
            @Value("${app.deepseek.base-url}") String baseUrl,
            @Value("${app.deepseek.model}") String model) {
        this.apiKey = apiKey;
        this.baseUrl = baseUrl;
        this.model = model;
    }

    public boolean isAvailable() {
        return apiKey != null && !apiKey.isBlank();
    }

    /**
     * 生成一期「思考一下」的题目。
     *
     * @param category     题目类别（产品分析 / 历史事件判断 / 架构设计）
     * @param recentTitles 最近几期已出过的题目（避免重复话题）
     * @return 题目全文（含背景与作答要求）
     */
    public String generateQuestion(String category, List<String> recentTitles) {
        String avoid = recentTitles.isEmpty() ? "（暂无历史题目）" : String.join("；", recentTitles);
        String prompt = switch (category) {
            case "产品分析" -> """
                    请为一位想提升产品思维的年轻开发者出一道「产品分析」题。
                    要求：
                    1. 选题对象是当前（2025-2026年）真正爆火或广受讨论的产品、功能或现象（如 AI 应用、现象级 App、出圈的硬件等），要具体到某一个产品/功能，不要泛泛而谈。
                    2. 先简述该产品的来龙去脉（它是什么、为什么火），再提出 2~3 个层层递进的分析要求，例如：它切中了什么真实需求、增长或传播的关键设计是什么、可持续性如何、如果让你做会如何取舍。
                    3. 题目要有可写性，能支撑一篇 500 字以上的分析文档。
                    4. 不要与这些已出过的题目重复：%s
                    直接输出题目全文（150~300字），不要输出其他任何解释。""";
            case "历史事件判断" -> """
                    请为一位想提升商业判断力的年轻开发者出一道「历史成功事件复盘」题。
                    要求：
                    1. 选取科技/互联网/商业史上一个公认的成功事件或产品转折点（如某公司关键决策、某产品冷启动成功等），有公认的事实结果。
                    2. 题目设计为「先判断后验证」：描述事件当时的背景和处境（隐去结局），要求作答者先给出自己的判断——如果他是当事人会怎么做、认为成功的关键是什么；然后再去查证真实的历史路径，对比并修正自己的判断。
                    3. 明确列出作答的三个步骤：我的判断 → 真实路径查证 → 偏差分析与收获。
                    4. 不要与这些已出过的题目重复：%s
                    直接输出题目全文（150~300字），不要输出其他任何解释。""";
            default -> """
                    请为一位想提升架构能力的后端开发者出一道「架构设计」题。
                    要求：
                    1. 给出一个需求明确、规模具体的功能场景（如设计一个百万级 UV 的签到系统、实时排行榜、秒杀下单链路、站内信推送系统等），写清楚业务约束和量级。
                    2. 提出 2~3 个设计要求，例如：核心数据模型与存储选型、关键链路的时序与瓶颈预判、高并发/高可用下的取舍、如何分阶段落地。
                    3. 题目要考察真实工程权衡，不要八股文；能支撑一篇含架构图说明的设计文档。
                    4. 不要与这些已出过的题目重复：%s
                    直接输出题目全文（150~300字），不要输出其他任何解释。""";
        };
        return chat("你是一位资深的产品与技术导师，善于出有深度、能引发深度思考的题目。",
                prompt.formatted(avoid), 0.9);
    }

    /**
     * 质检结果。
     *
     * @param passed 是否通过
     * @param note   一句话理由
     */
    public record ReviewResult(boolean passed, String note) {
    }

    /**
     * 质检一道已生成的题目：具体性 / 可写性 / 类别匹配 / 事实可信度。
     * 用低温度、严格的输出格式，宁枉勿纵。
     */
    public ReviewResult reviewQuestion(String category, String questionText) {
        String prompt = """
                请严格质检下面这道「%s」类别的思考题，按清单逐项审查：
                1. 具体性：是否指向一个具体的产品/事件/功能场景，而不是泛泛的主题或纯抽象问题？
                2. 可写性：是否有足够的分析纵深，能支撑一篇 500 字以上的深度文档？
                3. 类别匹配：内容是否符合「%s」的出题定位？
                4. 事实可信度：题目中涉及的产品、事件、数据是否真实存在且基本准确？疑似编造、张冠李戴、把冷门说成爆火、虚构产品名或公司的，一律判 FAIL。

                【题目】
                %s

                输出格式（严格遵守，不要输出任何其他内容）：
                第一行只输出 PASS 或 FAIL 一个词；
                第二行输出一句话理由（30字以内）。""";
        String result = chat("你是一位苛刻的出题质量审查员，宁枉勿纵。",
                prompt.formatted(category, category, questionText), 0.2);
        String[] lines = result.split("\n", 2);
        boolean passed = lines[0].trim().equalsIgnoreCase("PASS");
        String note = lines.length > 1 ? lines[1].trim() : "";
        return new ReviewResult(passed, note);
    }

    /**
     * 评判用户的作答文档。
     *
     * @return Markdown 格式的评判（总体评价/亮点/不足/建议/参考结论）
     */
    public String evaluateAnswer(String category, String questionText, String answerPlainText) {
        String categoryExtra = "历史事件判断".equals(category)
                ? "5. 特别地：本题是「先判断后验证」类型，请重点对比作答者的判断与真实历史路径的偏差——他判断对了什么、漏掉了什么关键事实、决策思维上有什么惯性误区。\n"
                : "";
        String prompt = """
                你是一位资深的产品与技术导师。请阅读下面的题目和作答者的完整回答，给出认真、具体、有建设性的评判。

                【题目类别】%s
                【题目】
                %s

                【作答者的回答】
                %s

                请按以下结构输出 Markdown 格式的评判：
                ## 总体评价
                一段话概括这份回答的水平（好在哪里、主要差距是什么），并给出百分制评分。
                ## 亮点
                分点列出回答中真正有价值、思考到位的地方（要具体引用其观点，不要空泛夸奖）。
                ## 不足与盲区
                分点指出思考不够深、逻辑跳跃、遗漏的关键角度（要指到具体的点）。
                ## 具体建议
                针对每条不足给出可执行的改进方向；如果是产品/架构题，指出业界通常的做法作为参照。
                ## 参考结论
                给出你作为导师对这道题的完整思考结论，让作答者可以对照修正自己的认知。
                %s
                要求：真诚直接，不要为了鼓励而回避问题；评判要基于回答的实际内容，不要套话。""";
        return chat("你是一位严格而真诚的导师，擅长发现思考中的盲区。",
                prompt.formatted(category, questionText, answerPlainText, categoryExtra), 0.4);
    }

    /** 调一次 chat/completions，返回 assistant 的文本内容 */
    private String chat(String systemPrompt, String userPrompt, double temperature) {
        if (!isAvailable()) {
            throw new BusinessException("AI 服务未配置（缺少 DEEPSEEK_API_KEY）");
        }
        try {
            ObjectNode body = objectMapper.createObjectNode();
            body.put("model", model);
            body.put("temperature", temperature);
            body.put("stream", false);
            ArrayNode messages = body.putArray("messages");
            messages.addObject().put("role", "system").put("content", systemPrompt);
            messages.addObject().put("role", "user").put("content", userPrompt);

            HttpRequest request = HttpRequest.newBuilder()
                    .uri(URI.create(baseUrl))
                    .timeout(Duration.ofSeconds(120))
                    .header("Content-Type", "application/json")
                    .header("Authorization", "Bearer " + apiKey)
                    .POST(HttpRequest.BodyPublishers.ofString(objectMapper.writeValueAsString(body)))
                    .build();

            HttpResponse<String> response = httpClient.send(request, HttpResponse.BodyHandlers.ofString());
            if (response.statusCode() != 200) {
                log.error("DeepSeek API 返回 {}: {}", response.statusCode(),
                        response.body() == null ? "" : response.body().substring(0, Math.min(500, response.body().length())));
                throw new BusinessException("AI 服务调用失败（HTTP " + response.statusCode() + "），请稍后再试");
            }
            JsonNode root = objectMapper.readTree(response.body());
            String content = root.path("choices").path(0).path("message").path("content").asText("");
            if (content.isBlank()) {
                throw new BusinessException("AI 返回了空内容，请稍后再试");
            }
            return content.trim();
        } catch (BusinessException e) {
            throw e;
        } catch (Exception e) {
            log.error("DeepSeek API 调用异常", e);
            throw new BusinessException("AI 服务暂时不可用，请稍后再试");
        }
    }
}
