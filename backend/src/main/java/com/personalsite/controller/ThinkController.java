package com.personalsite.controller;

import com.personalsite.dto.ApiResponse;
import com.personalsite.dto.ThinkAnswerRequest;
import com.personalsite.dto.ThinkCurrentDTO;
import com.personalsite.dto.ThinkHistoryItemDTO;
import com.personalsite.service.ThinkService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;
import java.util.List;

/**
 * 「思考一下」：每 3 天一期深度思考题 + AI 评判。
 * GET 公开；保存/提交/换题仅管理员（SecurityConfig 兜底规则）。
 * 作答按 questionId 路由——当期可答，往期未答的题也允许补答。
 */
@RestController
@RequestMapping("/api/think")
@RequiredArgsConstructor
public class ThinkController {
    private final ThinkService thinkService;

    /** 当前期题目 + 我的作答 + 评判状态（当前期的轮询也用此接口） */
    @GetMapping("/current")
    public ApiResponse<ThinkCurrentDTO> current() {
        return ApiResponse.success(thinkService.getCurrent());
    }

    /** 往期题目列表（不含当前期） */
    @GetMapping("/history")
    public ApiResponse<List<ThinkHistoryItemDTO>> history() {
        return ApiResponse.success(thinkService.getHistory());
    }

    /** 单题视图：题目 + 作答 + 评判（补答提交后的轮询用） */
    @GetMapping("/questions/{questionId}")
    public ApiResponse<ThinkHistoryItemDTO> getQuestion(@PathVariable Long questionId) {
        return ApiResponse.success(thinkService.getQuestion(questionId));
    }

    /** 保存草稿（不触发评判；当期/往期题均可） */
    @PutMapping("/questions/{questionId}/answer")
    public ApiResponse<ThinkHistoryItemDTO> saveAnswer(@PathVariable Long questionId,
                                                       @Valid @RequestBody ThinkAnswerRequest request) {
        return ApiResponse.success(thinkService.saveAnswer(questionId, request.getAnswerHtml()));
    }

    /** 提交作答并触发 AI 异步评判（当期/往期题均可，随后轮询 /questions/{id}） */
    @PostMapping("/questions/{questionId}/submit")
    public ApiResponse<ThinkHistoryItemDTO> submit(@PathVariable Long questionId,
                                                   @Valid @RequestBody ThinkAnswerRequest request) {
        return ApiResponse.success(thinkService.submitAnswer(questionId, request.getAnswerHtml()));
    }

    /** 换一道：重新生成当前期题目（会清空本期已有作答） */
    @PostMapping("/current/regenerate")
    public ApiResponse<ThinkCurrentDTO> regenerate() {
        return ApiResponse.success(thinkService.regenerateCurrent());
    }
}
