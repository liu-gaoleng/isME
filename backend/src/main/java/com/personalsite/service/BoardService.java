package com.personalsite.service;

import com.personalsite.dto.BoardDTO;
import com.personalsite.entity.Board;
import com.personalsite.exception.BusinessException;
import com.personalsite.repository.BoardRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class BoardService {
    private final BoardRepository boardRepository;

    /** 列表：不返回 sceneJson，避免一次拉回全部画布数据 */
    public List<BoardDTO> getAllBoards() {
        return boardRepository.findAllByOrderByUpdatedAtDesc().stream()
                .map(b -> toDTO(b, false))
                .collect(Collectors.toList());
    }

    /** 详情：返回完整场景 */
    public BoardDTO getBoardById(Long id) {
        Board board = boardRepository.findById(id)
                .orElseThrow(() -> new BusinessException("画板不存在"));
        return toDTO(board, true);
    }

    @Transactional
    public BoardDTO createBoard(BoardDTO dto) {
        Board board = new Board();
        board.setTitle(resolveTitle(dto.getTitle()));
        board.setSceneJson(dto.getSceneJson());
        return toDTO(boardRepository.save(board), true);
    }

    @Transactional
    public BoardDTO updateBoard(Long id, BoardDTO dto) {
        Board board = boardRepository.findById(id)
                .orElseThrow(() -> new BusinessException("画板不存在"));
        if (dto.getTitle() != null) {
            board.setTitle(resolveTitle(dto.getTitle()));
        }
        // sceneJson 允许覆盖为任意值（含清空），只要字段出现在请求里就更新
        if (dto.getSceneJson() != null) {
            board.setSceneJson(dto.getSceneJson());
        }
        return toDTO(boardRepository.save(board), true);
    }

    @Transactional
    public void deleteBoard(Long id) {
        if (!boardRepository.existsById(id)) {
            throw new BusinessException("画板不存在");
        }
        boardRepository.deleteById(id);
    }

    private String resolveTitle(String title) {
        return (title == null || title.isBlank()) ? "未命名画板" : title.trim();
    }

    private BoardDTO toDTO(Board board, boolean withScene) {
        BoardDTO dto = new BoardDTO();
        dto.setId(board.getId());
        dto.setTitle(board.getTitle());
        if (withScene) {
            dto.setSceneJson(board.getSceneJson());
        }
        dto.setCreatedAt(board.getCreatedAt());
        dto.setUpdatedAt(board.getUpdatedAt());
        return dto;
    }
}
