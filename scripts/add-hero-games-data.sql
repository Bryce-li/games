-- ================================
-- 英雄区游戏数据插入脚本
-- ================================

-- 插入英雄区游戏配置
-- 注意：这里使用的game_id是业务标识符，需要确保在games表中存在对应的记录

INSERT INTO hero_games (game_id, display_order, is_active) VALUES
('cat-mini-restaurant', 1, true),
('count-masters-stickman-games', 2, true),
('stone-grass-mowing-simulator', 3, true),
('ragdoll-archers', 4, true),
('zombie-horde-build-survive', 5, true)
ON CONFLICT (game_id) DO UPDATE SET
  display_order = EXCLUDED.display_order,
  is_active = EXCLUDED.is_active,
  updated_at = NOW();

-- 验证插入结果
SELECT 
  hg.game_id,
  hg.display_order,
  hg.is_active,
  g.title,
  g.image_url,
  g.description
FROM hero_games hg
LEFT JOIN games g ON hg.game_id = g.game_id
WHERE hg.is_active = true
ORDER BY hg.display_order; 