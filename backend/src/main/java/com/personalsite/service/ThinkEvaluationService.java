package com.personalsite.service;

import com.personalsite.entity.ThinkAnswer;
import com.personalsite.entity.ThinkQuestion;
import com.personalsite.repository.ThinkAnswerRepository;
import com.personalsite.repository.ThinkQuestionRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * 「思考一下」AI 评判执行器（独立 Bean，避免 @Async 自调用失效）。
 * 由 ThinkService 在事务提交后（afterCommit）触发，保证读到已落库的答案。
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class ThinkEvaluationService {
    private final ThinkAnswerRepository answerRepository;
    private final ThinkQuestionRepository questionRepository;
    private final DeepSeekClient deepSeekClient;

    @Async
    @Transactional
    public void evaluate(Long answerId) {
        ThinkAnswer answer = answerRepository.findById(answerId).orElse(null);
        if (answer == null) {
            return;
        }
        ThinkQuestion question = questionRepository.findById(answer.getQuestionId()).orElse(null);
        if (question == null) {
            return;
        }
        try {
            String plainText = htmlToPlainText(answer.getAnswerHtml());
            String feedback = deepSeekClient.evaluateAnswer(
                    question.getCategory(), question.getQuestionText(), plainText);
            answer.setAiFeedback(feedback);
            answer.setEvalStatus("DONE");
        } catch (Exception e) {
            log.error("AI 评判失败 answerId={}", answerId, e);
            answer.setEvalStatus("FAILED");
        }
        answerRepository.save(answer);
    }

    /** 富文本转纯文本（供 AI 阅读）：去标签、压空白 */
    private String htmlToPlainText(String html) {
        if (html == null) {
            return "";
        }
        return html.replaceAll("<br\\s*/?>", "\n")
                .replaceAll("</p>", "\n\n")
                .replaceAll("</li>", "\n")
                .replaceAll("<[^>]+>", "")
                .replaceAll("&nbsp;", " ")
                .replaceAll("&amp;", "&")
                .replaceAll("&lt;", "<")
                .replaceAll("&gt;", ">")
                .replaceAll("&quot;", "\"")
                .replaceAll("\\n{3,}", "\n\n")
                .trim();
    }
}
