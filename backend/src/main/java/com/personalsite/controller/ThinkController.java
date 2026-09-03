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
 */
@RestController
@RequestMapping("/api/think")
@RequiredArgsConstructor
public class ThinkController {
    private final ThinkService thinkService;

    /** 当前期题目 + 我的作答 + 评判状态（前端轮询评判结果也用此接口） */
    @GetMapping("/current")
    public ApiResponse<ThinkCurrentDTO> current() {
        return ApiResponse.success(thinkService.getCurrent());
    }

    /** 往期题目列表（不含当前期） */
    @GetMapping("/history")
    public ApiResponse<List<ThinkHistoryItemDTO>> history() {
        return ApiResponse.success(thinkService.getHistory());
    }

    /** 保存草稿（不触发评判） */
    @PutMapping("/current/answer")
    public ApiResponse<ThinkCurrentDTO> saveAnswer(@Valid @RequestBody ThinkAnswerRequest request) {
        return ApiResponse.success(thinkService.saveAnswer(request.getAnswerHtml()));
    }

    /** 提交作答并触发 AI 异步评判（随后轮询 /current 拿结果） */
    @PostMapping("/current/submit")
    public ApiResponse<ThinkCurrentDTO> submit(@Valid @RequestBody ThinkAnswerRequest request) {
        return ApiResponse.success(thinkService.submitAnswer(request.getAnswerHtml()));
    }

    /** 换一道：重新生成当前期题目（会清空本期已有作答） */
    @PostMapping("/current/regenerate")
    public ApiResponse<ThinkCurrentDTO> regenerate() {
        return ApiResponse.success(thinkService.regenerateCurrent());
    }
}
