package com.personalsite.service;

import com.personalsite.dto.HappyMomentDTO;
import com.personalsite.entity.HappyMoment;
import com.personalsite.exception.BusinessException;
import com.personalsite.repository.HappyMomentRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.time.LocalDate;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class HappyMomentService {
    private final HappyMomentRepository happyMomentRepository;

    public List<HappyMomentDTO> getAll() {
        return happyMomentRepository.findAllByOrderByHappenedOnDescCreatedAtDesc().stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }

    @Transactional
    public HappyMomentDTO create(HappyMomentDTO dto) {
        HappyMoment moment = new HappyMoment();
        moment.setContent(dto.getContent().trim());
        moment.setHappenedOn(dto.getHappenedOn() != null ? dto.getHappenedOn() : LocalDate.now());
        return toDTO(happyMomentRepository.save(moment));
    }

    @Transactional
    public HappyMomentDTO update(Long id, HappyMomentDTO dto) {
        HappyMoment moment = happyMomentRepository.findById(id)
                .orElseThrow(() -> new BusinessException("记录不存在"));
        if (dto.getContent() != null && !dto.getContent().isBlank()) {
            moment.setContent(dto.getContent().trim());
        }
        if (dto.getHappenedOn() != null) {
            moment.setHappenedOn(dto.getHappenedOn());
        }
        return toDTO(happyMomentRepository.save(moment));
    }

    @Transactional
    public void delete(Long id) {
        if (!happyMomentRepository.existsById(id)) {
            throw new BusinessException("记录不存在");
        }
        happyMomentRepository.deleteById(id);
    }

    private HappyMomentDTO toDTO(HappyMoment moment) {
        HappyMomentDTO dto = new HappyMomentDTO();
        dto.setId(moment.getId());
        dto.setContent(moment.getContent());
        dto.setHappenedOn(moment.getHappenedOn());
        dto.setCreatedAt(moment.getCreatedAt());
        return dto;
    }
}
