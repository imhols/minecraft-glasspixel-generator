import AdmZip from 'adm-zip'
import { PNG } from 'pngjs'
import fs from 'fs'
import path from 'path'
import { tmpdir } from 'os'
import { createServer } from 'net'

const VERSIONS = ['1.13.2', '1.16.5', '1.17.1', '1.19', '1.20', '1.21']
const MANIFEST_URL = 'https://piston-meta.mojang.com/mc/game/version_manifest_v2.json'
const TEXTURE_DIR_13 = 'assets/minecraft/textures/block/'
const TEXTURE_DIR_12 = 'assets/minecraft/textures/blocks/'
const FACE_SUFFIXES = ['_top', '_bottom', '_side', '_front', '_back', '_north', '_south', '_east', '_west', '_inner', '_outer']
const STATE_EXCLUDE_LIST = ['_on', '_lit', '_powered', '_0', '_1', '_2', '_3', '_4', '_5', '_6', '_7', '_8', '_9', '_stage0', '_stage1', '_stage2']
const STATE_DEFAULT_LIST = ['_off', '_unlit', '_unpowered']
const SKIP_TEXTURES = new Set([
  'destroy_stage_0', 'destroy_stage_1', 'destroy_stage_2', 'destroy_stage_3', 'destroy_stage_4', 'destroy_stage_5', 'destroy_stage_6', 'destroy_stage_7', 'destroy_stage_8', 'destroy_stage_9',
  'particle', 'map_icons', 'moon', 'sun', 'underwater',
  'pumpkin_face_off', 'pumpkin_face_on',
  'enchanting_table_side', 'enchanting_table_top', 'enchanting_table_bottom',
  'jukebox_side', 'jukebox_top',
])

// Blocks whose texture names DON'T directly map to block IDs
const TEXTURE_TO_BLOCK = new Map([
  ['wool_colored_white', 'white_wool'],
  ['wool_colored_orange', 'orange_wool'],
  ['wool_colored_magenta', 'magenta_wool'],
  ['wool_colored_light_blue', 'light_blue_wool'],
  ['wool_colored_yellow', 'yellow_wool'],
  ['wool_colored_lime', 'lime_wool'],
  ['wool_colored_pink', 'pink_wool'],
  ['wool_colored_gray', 'gray_wool'],
  ['wool_colored_silver', 'light_gray_wool'],
  ['wool_colored_cyan', 'cyan_wool'],
  ['wool_colored_purple', 'purple_wool'],
  ['wool_colored_blue', 'blue_wool'],
  ['wool_colored_brown', 'brown_wool'],
  ['wool_colored_green', 'green_wool'],
  ['wool_colored_red', 'red_wool'],
  ['wool_colored_black', 'black_wool'],
  ['stone_slab_side', 'stone_slab'],
  ['stone_slab_top', 'stone_slab'],
  ['grass_block_side', 'grass_block'],
  ['grass_block_top', 'grass_block'],
  ['grass_block_snow', 'grass_block'],
  ['mushroom_block_skin_stem', 'mushroom_stem'],
  ['mushroom_block_skin_brown', 'brown_mushroom_block'],
  ['mushroom_block_skin_red', 'red_mushroom_block'],
  ['mushroom_block_inside', 'brown_mushroom_block'],
  ['pumpkin_side', 'pumpkin'],
  ['pumpkin_top', 'pumpkin'],
  ['pumpkin_face_off', 'pumpkin'],
  ['pumpkin_top', 'pumpkin'],
  ['pumpkin_side', 'pumpkin'],
  ['carved_pumpkin_top', 'carved_pumpkin'],
  ['melon_side', 'melon'],
  ['melon_top', 'melon'],
  ['cactus_side', 'cactus'],
  ['cactus_top', 'cactus'],
  ['cactus_bottom', 'cactus'],
  ['log_oak', 'oak_log'],
  ['log_oak_top', 'oak_log'],
  ['log_spruce', 'spruce_log'],
  ['log_spruce_top', 'spruce_log'],
  ['log_birch', 'birch_log'],
  ['log_birch_top', 'birch_log'],
  ['log_jungle', 'jungle_log'],
  ['log_jungle_top', 'jungle_log'],
  ['log_acacia', 'acacia_log'],
  ['log_acacia_top', 'acacia_log'],
  ['log_big_oak', 'dark_oak_log'],
  ['log_big_oak_top', 'dark_oak_log'],
  ['planks_oak', 'oak_planks'],
  ['planks_spruce', 'spruce_planks'],
  ['planks_birch', 'birch_planks'],
  ['planks_jungle', 'jungle_planks'],
  ['planks_acacia', 'acacia_planks'],
  ['planks_big_oak', 'dark_oak_planks'],
  ['leaves_oak', 'oak_leaves'],
  ['leaves_spruce', 'spruce_leaves'],
  ['leaves_birch', 'birch_leaves'],
  ['leaves_jungle', 'jungle_leaves'],
  ['leaves_acacia', 'acacia_leaves'],
  ['leaves_big_oak', 'dark_oak_leaves'],
  ['sapling_oak', 'oak_sapling'],
  ['sapling_spruce', 'spruce_sapling'],
  ['sapling_birch', 'birch_sapling'],
  ['sapling_jungle', 'jungle_sapling'],
  ['sapling_acacia', 'acacia_sapling'],
  ['sapling_roofed_oak', 'dark_oak_sapling'],
  ['tallgrass', 'grass'],
  ['farmland_dry', 'farmland'],
  ['farmland_wet', 'farmland'],
  ['water_still', 'water'],
  ['water_flow', 'water'],
  ['water_still', 'water'],
  ['lava_still', 'lava'],
  ['lava_flow', 'lava'],
  ['door_wood_upper', 'oak_door'],
  ['door_wood_lower', 'oak_door'],
  ['door_iron_upper', 'iron_door'],
  ['door_iron_lower', 'iron_door'],
  ['trapdoor', 'oak_trapdoor'],
  ['stonebrick', 'stone_bricks'],
  ['stonebrick_carved', 'chiseled_stone_bricks'],
  ['stonebrick_mossy', 'mossy_stone_bricks'],
  ['stonebrick_cracked', 'cracked_stone_bricks'],
  ['hardened_clay', 'terracotta'],
  ['hardened_clay_stained_white', 'white_terracotta'],
  ['hardened_clay_stained_orange', 'orange_terracotta'],
  ['hardened_clay_stained_magenta', 'magenta_terracotta'],
  ['hardened_clay_stained_light_blue', 'light_blue_terracotta'],
  ['hardened_clay_stained_yellow', 'yellow_terracotta'],
  ['hardened_clay_stained_lime', 'lime_terracotta'],
  ['hardened_clay_stained_pink', 'pink_terracotta'],
  ['hardened_clay_stained_gray', 'gray_terracotta'],
  ['hardened_clay_stained_silver', 'light_gray_terracotta'],
  ['hardened_clay_stained_cyan', 'cyan_terracotta'],
  ['hardened_clay_stained_purple', 'purple_terracotta'],
  ['hardened_clay_stained_blue', 'blue_terracotta'],
  ['hardened_clay_stained_brown', 'brown_terracotta'],
  ['hardened_clay_stained_green', 'green_terracotta'],
  ['hardened_clay_stained_red', 'red_terracotta'],
  ['hardened_clay_stained_black', 'black_terracotta'],
  ['concrete_white', 'white_concrete'],
  ['concrete_orange', 'orange_concrete'],
  ['concrete_magenta', 'magenta_concrete'],
  ['concrete_light_blue', 'light_blue_concrete'],
  ['concrete_yellow', 'yellow_concrete'],
  ['concrete_lime', 'lime_concrete'],
  ['concrete_pink', 'pink_concrete'],
  ['concrete_gray', 'gray_concrete'],
  ['concrete_silver', 'light_gray_concrete'],
  ['concrete_cyan', 'cyan_concrete'],
  ['concrete_purple', 'purple_concrete'],
  ['concrete_blue', 'blue_concrete'],
  ['concrete_brown', 'brown_concrete'],
  ['concrete_green', 'green_concrete'],
  ['concrete_red', 'red_concrete'],
  ['concrete_black', 'black_concrete'],
  ['glass_white', 'white_stained_glass'],
  ['glass_orange', 'orange_stained_glass'],
  ['glass_magenta', 'magenta_stained_glass'],
  ['glass_light_blue', 'light_blue_stained_glass'],
  ['glass_yellow', 'yellow_stained_glass'],
  ['glass_lime', 'lime_stained_glass'],
  ['glass_pink', 'pink_stained_glass'],
  ['glass_gray', 'gray_stained_glass'],
  ['glass_silver', 'light_gray_stained_glass'],
  ['glass_cyan', 'cyan_stained_glass'],
  ['glass_purple', 'purple_stained_glass'],
  ['glass_blue', 'blue_stained_glass'],
  ['glass_brown', 'brown_stained_glass'],
  ['glass_green', 'green_stained_glass'],
  ['glass_red', 'red_stained_glass'],
  ['glass_black', 'black_stained_glass'],
  ['glass', 'glass'],
  ['endframe_top', 'end_portal_frame'],
  ['endframe_side', 'end_portal_frame'],
  ['endframe_eye', 'end_portal_frame'],
  ['mushroom_stem', 'mushroom_stem'],
  ['command_block_back', 'command_block'],
  ['command_block_conditional', 'command_block'],
  ['command_block_front', 'command_block'],
  ['command_block_side', 'command_block'],
  ['repeating_command_block_back', 'repeating_command_block'],
  ['repeating_command_block_conditional', 'repeating_command_block'],
  ['repeating_command_block_front', 'repeating_command_block'],
  ['repeating_command_block_side', 'repeating_command_block'],
  ['chain_command_block_back', 'chain_command_block'],
  ['chain_command_block_conditional', 'chain_command_block'],
  ['chain_command_block_front', 'chain_command_block'],
  ['chain_command_block_side', 'chain_command_block'],
  ['beacon', 'beacon'],
  ['observer_back', 'observer'],
  ['observer_front', 'observer'],
  ['observer_side', 'observer'],
  ['observer_top', 'observer'],
  ['daylight_detector_side', 'daylight_detector'],
  ['daylight_detector_top', 'daylight_detector'],
  ['daylight_detector_inverted_top', 'daylight_detector'],
  ['furnace_front_off', 'furnace'],
  ['furnace_front_on', 'furnace'],
  ['furnace_side', 'furnace'],
  ['furnace_top', 'furnace'],
  ['dispenser_front_vertical', 'dispenser'],
  ['dispenser_front_horizontal', 'dispenser'],
  ['dropper_front_vertical', 'dropper'],
  ['dropper_front_horizontal', 'dropper'],
  ['crafting_table_front', 'crafting_table'],
  ['crafting_table_side', 'crafting_table'],
  ['crafting_table_top', 'crafting_table'],
  ['bookshelf', 'bookshelf'],
  ['netherrack', 'netherrack'],
  ['nether_brick', 'nether_bricks'],
  ['quartz_block_side', 'quartz_block'],
  ['quartz_block_top', 'quartz_block'],
  ['quartz_block_bottom', 'quartz_block'],
  ['quartz_block_chiseled', 'chiseled_quartz_block'],
  ['quartz_block_chiseled_top', 'chiseled_quartz_block'],
  ['quartz_pillar_top', 'quartz_pillar'],
  ['quartz_pillar_side', 'quartz_pillar'],
  ['purpur_pillar_top', 'purpur_pillar'],
  ['purpur_pillar_side', 'purpur_pillar'],
  ['purpur_block', 'purpur_block'],
  ['end_stone', 'end_stone'],
  ['end_bricks', 'end_stone_bricks'],
  ['bone_block_side', 'bone_block'],
  ['bone_block_top', 'bone_block'],
  ['slime_block', 'slime_block'],
  ['sponge', 'sponge'],
  ['dry_sponge', 'sponge'],
  ['shulker_top', 'shulker_box'],
  ['shulker_side', 'shulker_box'],
  ['shulker_bottom', 'shulker_box'],
  ['melon_stem_connected', 'melon_stem'],
  ['pumpkin_stem_connected', 'pumpkin_stem'],
  ['attached_melon_stem', 'melon_stem'],
  ['attached_pumpkin_stem', 'pumpkin_stem'],
  ['vine', 'vine'],
  ['lily_pad', 'lily_pad'],
  ['cobweb', 'cobweb'],
  ['composter_bottom', 'composter'],
  ['composter_side', 'composter'],
  ['composter_top', 'composter'],
  ['composter_compost_0', 'composter'],
  ['composter_compost_1', 'composter'],
  ['composter_compost_2', 'composter'],
  ['composter_compost_3', 'composter'],
  ['composter_compost_4', 'composter'],
  ['composter_compost_5', 'composter'],
  ['composter_compost_6', 'composter'],
  ['composter_compost_7', 'composter'],
  ['composter_ready', 'composter'],
  ['honey_block_top', 'honey_block'],
  ['honey_block_side', 'honey_block'],
  ['honey_block_bottom', 'honey_block'],
  ['honeycomb_block', 'honeycomb_block'],
  ['target_side', 'target'],
  ['target_top', 'target'],
  ['lodestone_side', 'lodestone'],
  ['lodestone_top', 'lodestone'],
  ['respawn_anchor_side_0', 'respawn_anchor'],
  ['respawn_anchor_side_1', 'respawn_anchor'],
  ['respawn_anchor_side_2', 'respawn_anchor'],
  ['respawn_anchor_side_3', 'respawn_anchor'],
  ['respawn_anchor_side_4', 'respawn_anchor'],
  ['respawn_anchor_top', 'respawn_anchor'],
  ['respawn_anchor_bottom', 'respawn_anchor'],
  ['crying_obsidian', 'crying_obsidian'],
  ['crimson_nylium', 'crimson_nylium'],
  ['crimson_nylium_side', 'crimson_nylium'],
  ['warped_nylium', 'warped_nylium'],
  ['warped_nylium_side', 'warped_nylium'],
  ['crimson_planks', 'crimson_planks'],
  ['warped_planks', 'warped_planks'],
  ['crimson_stem_side', 'crimson_stem'],
  ['crimson_stem_top', 'crimson_stem'],
  ['warped_stem_side', 'warped_stem'],
  ['warped_stem_top', 'warped_stem'],
  ['shroomlight', 'shroomlight'],
  ['netherite_block', 'netherite_block'],
  ['ancient_debris_side', 'ancient_debris'],
  ['ancient_debris_top', 'ancient_debris'],
  ['basalt_side', 'basalt'],
  ['basalt_top', 'basalt'],
  ['blackstone', 'blackstone'],
  ['blackstone_top', 'blackstone'],
  ['gilded_blackstone', 'gilded_blackstone'],
  ['chiseled_nether_bricks', 'chiseled_nether_bricks'],
  ['cracked_nether_bricks', 'cracked_nether_bricks'],
  ['nether_gold_ore', 'nether_gold_ore'],
  ['quartz_ore', 'nether_quartz_ore'],
  ['crimson_roots', 'crimson_roots'],  // TODO not a full block but has color
  ['warped_roots', 'warped_roots'],
  ['warped_wart_block', 'warped_wart_block'],
  ['nether_wart_block', 'nether_wart_block'],
  ['magma', 'magma_block'],
  ['soul_sand', 'soul_sand'],
  ['soul_soil', 'soul_soil'],
  ['twisting_vines_plant', 'twisting_vines'],
  ['weeping_vines_plant', 'weeping_vines'],
  ['coal_block', 'coal_block'],
  ['redstone_block', 'redstone_block'],
  ['diamond_block', 'diamond_block'],
  ['emerald_block', 'emerald_block'],
  ['lapis_block', 'lapis_block'],
  ['gold_block', 'gold_block'],
  ['iron_block', 'iron_block'],
  ['copper_block', 'copper_block'],
  ['exposed_copper', 'exposed_copper'],
  ['weathered_copper', 'weathered_copper'],
  ['oxidized_copper', 'oxidized_copper'],
  ['waxed_copper_block', 'waxed_copper_block'],
  ['waxed_exposed_copper', 'waxed_exposed_copper'],
  ['waxed_weathered_copper', 'waxed_weathered_copper'],
  ['waxed_oxidized_copper', 'waxed_oxidized_copper'],
  ['calcite', 'calcite'],
  ['tuff', 'tuff'],
  ['dripstone_block', 'dripstone_block'],
  ['moss_block', 'moss_block'],
  ['mud', 'mud'],
  ['packed_mud', 'packed_mud'],
  ['mud_bricks', 'mud_bricks'],
  ['deepslate', 'deepslate'],
  ['deepslate_top', 'deepslate'],
  ['cobbled_deepslate', 'cobbled_deepslate'],
  ['polished_deepslate', 'polished_deepslate'],
  ['ochre_froglight_side', 'ochre_froglight'],
  ['ochre_froglight_top', 'ochre_froglight'],
  ['verdant_froglight_side', 'verdant_froglight'],
  ['verdant_froglight_top', 'verdant_froglight'],
  ['pearlescent_froglight_side', 'pearlescent_froglight'],
  ['pearlescent_froglight_top', 'pearlescent_froglight'],
  ['cherry_log_side', 'cherry_log'],
  ['cherry_log_top', 'cherry_log'],
  ['cherry_planks', 'cherry_planks'],
  ['cherry_leaves', 'cherry_leaves'],
  ['chiseled_bookshelf_side', 'chiseled_bookshelf'],
  ['chiseled_bookshelf_top', 'chiseled_bookshelf'],
  ['chiseled_bookshelf_empty', 'chiseled_bookshelf'],
  ['chiseled_bookshelf_occupied', 'chiseled_bookshelf'],
  ['chiseled_tuff', 'chiseled_tuff'],
  ['polished_tuff', 'polished_tuff'],
  ['tuff_bricks', 'tuff_bricks'],
  ['chiseled_tuff_bricks', 'chiseled_tuff_bricks'],
  ['barrel_top_open', 'barrel_top'],
  ['barrel_top', 'barrel'],
  ['barrel_side', 'barrel'],
  ['beehive_end', 'beehive'],
  ['beehive_front', 'beehive'],
  ['beehive_front_honey', 'beehive'],
  ['beehive_side', 'beehive'],
  ['bee_nest_front_honey', 'bee_nest'],
  ['bee_nest_top', 'bee_nest'],
  ['bee_nest_side', 'bee_nest'],
  ['bee_nest_bottom', 'bee_nest'],
  ['brewing_stand_base', 'brewing_stand'],
  ['cartography_table_side1', 'cartography_table'],
  ['cartography_table_side2', 'cartography_table'],
  ['cartography_table_side3', 'cartography_table'],
  ['cartography_table_top', 'cartography_table'],
  ['chorus_flower_dead', 'chorus_flower'],
  ['composter_bottom', 'composter'],
  ['composter_side', 'composter'],
  ['composter_top', 'composter'],
  ['composter_compost_0', 'composter'],
  ['composter_compost_1', 'composter'],
  ['composter_compost_2', 'composter'],
  ['composter_compost_3', 'composter'],
  ['composter_compost_4', 'composter'],
  ['composter_compost_5', 'composter'],
  ['composter_compost_6', 'composter'],
  ['composter_compost_7', 'composter'],
  ['composter_ready', 'composter'],
  ['crafter_bottom', 'crafter'],
  ['crafter_side', 'crafter'],
  ['crafter_top', 'crafter'],
  ['crafter_front', 'crafter'],
  ['creaking_heart_top', 'creaking_heart'],
  ['creaking_heart_side', 'creaking_heart'],
  ['decorated_pot_side', 'decorated_pot'],
  ['furnace_front_off', 'furnace'],
  ['furnace_front_on', 'furnace'],
  ['furnace_side', 'furnace'],
  ['furnace_top', 'furnace'],
  ['grindstone_side', 'grindstone'],
  ['grindstone_pivot', 'grindstone'],
  ['grindstone_round', 'grindstone'],
  ['hopper_inside', 'hopper'],
  ['hopper_outside', 'hopper'],
  ['hopper_top', 'hopper'],
  ['jukebox_side', 'jukebox'],
  ['jukebox_top', 'jukebox'],
  ['lectern_base', 'lectern'],
  ['lectern_front', 'lectern'],
  ['lectern_sides', 'lectern'],
  ['lectern_top', 'lectern'],
  ['loom_front', 'loom'],
  ['loom_side', 'loom'],
  ['loom_top', 'loom'],
  ['respawn_anchor_side_0', 'respawn_anchor'],
  ['respawn_anchor_side_1', 'respawn_anchor'],
  ['respawn_anchor_side_2', 'respawn_anchor'],
  ['respawn_anchor_side_3', 'respawn_anchor'],
  ['respawn_anchor_side_4', 'respawn_anchor'],
  ['respawn_anchor_top', 'respawn_anchor'],
  ['respawn_anchor_bottom', 'respawn_anchor'],
  ['sculk_catalyst_bottom', 'sculk_catalyst'],
  ['sculk_catalyst_side', 'sculk_catalyst'],
  ['sculk_catalyst_top', 'sculk_catalyst'],
  ['sculk_sensor_bottom', 'sculk_sensor'],
  ['sculk_sensor_side', 'sculk_sensor'],
  ['sculk_sensor_top', 'sculk_sensor'],
  ['sculk_shrieker_bottom', 'sculk_shrieker'],
  ['sculk_shrieker_inner_top', 'sculk_shrieker'],
  ['sculk_shrieker_side', 'sculk_shrieker'],
  ['sculk_shrieker_top', 'sculk_shrieker'],
  ['smithing_table_bottom', 'smithing_table'],
  ['smithing_table_front', 'smithing_table'],
  ['smithing_table_side', 'smithing_table'],
  ['smithing_table_top', 'smithing_table'],
  ['smoker_bottom', 'smoker'],
  ['smoker_front', 'smoker'],
  ['smoker_front_on', 'smoker'],
  ['smoker_side', 'smoker'],
  ['smoker_top', 'smoker'],
  ['spawner', 'spawner'],
  ['stonecutter_bottom', 'stonecutter'],
  ['stonecutter_top', 'stonecutter'],
  ['stonecutter_side', 'stonecutter'],
  ['stonecutter_saw', 'stonecutter'],
  ['trial_spawner_top', 'trial_spawner'],
  ['trial_spawner_side', 'trial_spawner'],
  ['trial_spawner_bottom', 'trial_spawner'],
  ['vault_front', 'vault'],
  ['vault_front_off', 'vault'],
  ['vault_side', 'vault'],
  ['vault_top', 'vault'],
  ['vault_bottom', 'vault'],
  ['snow', 'snow_block'],
])

function getFaceName(textureName) {
  const name = textureName.replace(/\.png$/, '')
  if (name.endsWith('_top')) return 'top'
  if (name.endsWith('_bottom')) return 'bottom'
  if (name.endsWith('_side')) return 'side'
  if (name.endsWith('_front')) return 'front'
  if (name.endsWith('_back')) return 'back'
  // For logs and pillars, no-suffix texture = side (bark)
  // Textures ending in _top/bottom that get stripped by getBlockName are handled above
  // Textures with no suffix represent the default face (usually side)
  return null
}

function getBlockName(textureName) {
  // Strip .png
  let name = textureName.replace(/\.png$/, '')

  // Skip known non-block textures
  if (SKIP_TEXTURES.has(name)) return null

  // Check explicit mapping
  if (TEXTURE_TO_BLOCK.has(name)) return TEXTURE_TO_BLOCK.get(name)

  // Strip face suffixes
  for (const suffix of FACE_SUFFIXES) {
    if (name.endsWith(suffix)) {
      const base = name.slice(0, -suffix.length)
      // Check if mapped version exists
      if (TEXTURE_TO_BLOCK.has(base) && TEXTURE_TO_BLOCK.get(base) !== base) return TEXTURE_TO_BLOCK.get(base)
      return base
    }
  }

  // Check if this is a state variant (on/lit/powered)
  // Exclude powered/active states, prefer unpowered/default
  for (const suffix of STATE_EXCLUDE_LIST) {
    if (name.endsWith(suffix)) return null  // skip - active state variant
  }

  // Allow default state variants (off/unlit)
  for (const suffix of STATE_DEFAULT_LIST) {
    if (name.endsWith(suffix)) {
      const base = name.slice(0, -suffix.length)
      if (TEXTURE_TO_BLOCK.has(base) && TEXTURE_TO_BLOCK.get(base) !== base) return TEXTURE_TO_BLOCK.get(base)
      return base
    }
  }

  // Check for dimensional variants (_horizontal, _vertical)
  if (name.endsWith('_horizontal') || name.endsWith('_vertical')) return null

  return name
}

function computeAvgColor(pngData) {
  let r = 0, g = 0, b = 0, count = 0
  let minAlpha = 255
  const len = pngData.length
  for (let i = 0; i < len; i += 4) {
    const a = pngData[i + 3]
    minAlpha = Math.min(minAlpha, a)
    if (a > 0) {
      r += pngData[i] * a
      g += pngData[i + 1] * a
      b += pngData[i + 2] * a
      count += a
    }
  }
  if (count === 0) return null
  return {
    rgb: [Math.round(r / count), Math.round(g / count), Math.round(b / count)],
    fullyOpaque: minAlpha >= 254,
    anyTransparent: minAlpha < 200,
  }
}

function getTextureDir(versionId) {
  const major = parseInt(versionId)
  if (major >= 1 && versionId === '1.12.2') return TEXTURE_DIR_12
  // For 1.13+ (and 1.12.2 already handled above): 1.13 uses 'block'
  const minor = parseInt(versionId.split('.')[1])
  if (major > 1 || (major === 1 && minor >= 13)) return TEXTURE_DIR_13
  // Very old versions use 'blocks'
  return TEXTURE_DIR_12
}

async function getVersionManifest() {
  const res = await fetch(MANIFEST_URL)
  return res.json()
}

async function downloadJar(versionId) {
  console.log(`  Fetching manifest for ${versionId}...`)
  const manifest = await getVersionManifest()
  const ver = manifest.versions.find(v => v.id === versionId)
  if (!ver) throw new Error(`Version ${versionId} not found in manifest`)

  const res = await fetch(ver.url)
  const versionData = await res.json()
  const jarUrl = versionData.downloads.client.url

  console.log(`  Downloading client.jar (${versionId})...`)
  const jarRes = await fetch(jarUrl)
  const jarBuf = Buffer.from(await jarRes.arrayBuffer())
  return jarBuf
}

function extractTextures(jarBuf, versionId, tempDir) {
  const zip = new AdmZip(jarBuf)
  const entries = zip.getEntries()
  const textureDir = getTextureDir(versionId)
  const textures = {}
  let count = 0

  for (const entry of entries) {
    if (entry.entryName.startsWith(textureDir) && entry.entryName.endsWith('.png')) {
      const name = path.basename(entry.entryName)
      if (name.startsWith('_')) continue // skip metadata files like _all.png
      // Skip animated/huge textures
      const data = entry.getData()
      // Save PNG to temp for processing
      const tempPath = path.join(tempDir, name)
      fs.writeFileSync(tempPath, data)
      textures[name] = tempPath
      count++
    }
  }
  console.log(`  Found ${count} textures`)
  return textures
}

function processTextures(textures, tempDir) {
  const blockColors = new Map() // blockName -> [{texture, rgb, fullyOpaque, anyTransparent}]

  // Per-face colors: blockName -> { top?: rgb, bottom?: rgb, side?: rgb, front?: rgb, back?: rgb }
  const faceColors = new Map()

  for (const [texName, filePath] of Object.entries(textures)) {
    const blockName = getBlockName(texName)
    if (!blockName) continue

    let png
    try {
      png = PNG.sync.read(fs.readFileSync(filePath))
    } catch {
      continue
    }
    const result = computeAvgColor(png.data)
    if (!result) continue

    if (!blockColors.has(blockName)) blockColors.set(blockName, [])
    blockColors.get(blockName).push({
      texture: texName,
      ...result,
    })

    // Collect per-face color
    const faceName = getFaceName(texName)
    if (!faceColors.has(blockName)) faceColors.set(blockName, {})
    const faces = faceColors.get(blockName)
    if (faceName) {
      faces[faceName] = result.rgb
    } else {
      // No-suffix texture is the default/side face
      if (!faces._default) {
        faces._default = result.rgb
      }
    }
  }

  // Average multi-face colors
  const merged = new Map()
  for (const [blockName, entries] of blockColors) {
    if (entries.length === 0) continue
    const avgR = Math.round(entries.reduce((s, e) => s + e.rgb[0], 0) / entries.length)
    const avgG = Math.round(entries.reduce((s, e) => s + e.rgb[1], 0) / entries.length)
    const avgB = Math.round(entries.reduce((s, e) => s + e.rgb[2], 0) / entries.length)
    const fullyOpaque = entries.some(e => e.fullyOpaque)
    const anyTransparent = entries.some(e => e.anyTransparent)
    merged.set(blockName, { rgb: [avgR, avgG, avgB], fullyOpaque, anyTransparent })
  }

  // Promote _default to the missing face (top > side > bottom)
  for (const [, faces] of faceColors) {
    if (faces._default) {
      const namedKeys = Object.keys(faces).filter(k => k !== '_default')
      if (namedKeys.length >= 1) {
        if (!faces.top) faces.top = faces._default
        else if (!faces.side) faces.side = faces._default
        else if (!faces.bottom) faces.bottom = faces._default
      }
      delete faces._default
    }
  }

  return { merged, faceColors }
}

function detectStainedGlass(blockName) {
  return blockName.endsWith('_stained_glass')
}

function determineVersion() {
  // Return which MC version this block is for
  return ''
}

function formatPalette(merged, versionMap, versionOrders) {
  const blocks = []
  const glassBlocks = []

  for (const [blockName, data] of merged) {
    const versions = versionMap.get(blockName) || []
    if (versions.length === 0) continue

    // Check if this is a stained glass
    const isGlass = detectStainedGlass(blockName)
    const isTransparent = !data.fullyOpaque

    const entry = {
      name: blockName.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' '),
      id: `minecraft:${blockName}`,
      color: data.rgb,
      versions,
    }

    if (isGlass || isTransparent) {
      if (isTransparent) entry.transparent = true
      glassBlocks.push(entry)
    } else {
      blocks.push(entry)
    }
  }

  // Sort by name
  blocks.sort((a, b) => a.id.localeCompare(b.id))
  glassBlocks.sort((a, b) => a.id.localeCompare(b.id))

  // Generate TypeScript
  let ts = `import type { MCVersion } from '../types'\n\n`
  ts += `export const MC_VERSIONS: MCVersion[] = [\n`
  for (const v of versionOrders) {
    const label = getVersionLabel(v)
    ts += `  { id: '${v.id}', label: '${label}' },\n`
  }
  ts += `]\n\n`
  ts += `export interface PaletteBlock {\n`
  ts += `  name: string\n`
  ts += `  id: string\n`
  ts += `  color: [number, number, number]\n`
  ts += `  versions: string[]\n`
  ts += `  transparent?: boolean\n`
  ts += `}\n\n`

  ts += `const BLOCKS: PaletteBlock[] = [\n`
  for (const block of blocks) {
    const vStr = block.versions.map(v => `'${v}'`).join(', ')
    ts += `  { name: '${block.name}', id: '${block.id}', color: [${block.color.join(', ')}], versions: [${vStr}] },\n`
  }
  for (const glass of glassBlocks) {
    const vStr = glass.versions.map(v => `'${v}'`).join(', ')
    ts += `  { name: '${glass.name}', id: '${glass.id}', color: [${glass.color.join(', ')}], versions: [${vStr}]${glass.transparent ? ', transparent: true' : ''} },\n`
  }
  ts += `]\n\n`
  ts += `export function getBlocks(version: string, includeTransparent = false): PaletteBlock[] {\n`
  ts += `  return BLOCKS.filter(b => b.versions.includes(version) && (includeTransparent || !b.transparent))\n`
  ts += `}\n\n`
  ts += `export function getGlassBlocks(version: string): PaletteBlock[] {\n`
  ts += `  return BLOCKS.filter(b => b.versions.includes(version) && b.id.endsWith('_stained_glass'))\n`
  ts += `}\n\n`
  ts += `export function getAllBlocks(): PaletteBlock[] {\n`
  ts += `  return BLOCKS\n`
  ts += `}\n`

  return ts
}

function getVersionLabel(version) {
  const labels = {
    '1.12.2': '1.12.2',
    '1.13.2': '1.13 / 1.14 / 1.15',
    '1.16.5': '1.16',
    '1.17.1': '1.17 / 1.18',
    '1.19': '1.19',
    '1.20': '1.20',
    '1.21': '1.21+',
  }
  return labels[version.id] || version.id
}

async function main() {
  console.log('=== Minecraft Block Palette Generator ===\n')

  const outputDir = path.join(process.cwd(), 'output')
  if (!fs.existsSync(outputDir)) fs.mkdirSync(outputDir, { recursive: true })

  const versionOrders = [
    { id: '1.12.2', order: 0 }, // Legacy
    { id: '1.13.2', order: 1 },
    { id: '1.16.5', order: 2 },
    { id: '1.17.1', order: 3 },
    { id: '1.19', order: 4 },
    { id: '1.20', order: 5 },
    { id: '1.21', order: 6 },
  ]

  // Per-version data
  const versionColors = new Map() // version -> Map<blockName, {rgb, fullyOpaque, anyTransparent}>
  const allBlockVersions = new Map() // blockName -> Set<version>
  // Per-face data: blockName -> { top?: rgb, bottom?: rgb, side?: rgb, front?: rgb, back?: rgb }
  const mergedFaceColors = new Map()

  for (const v of versionOrders) {
    console.log(`\n[${v.id}]`)

    // Check if we already cached
    const cachePath = path.join(outputDir, `${v.id}.json`)
    const faceCachePath = path.join(outputDir, `${v.id}-faces.json`)
    if (fs.existsSync(cachePath)) {
      console.log(`  Loading cached data...`)
      const cached = JSON.parse(fs.readFileSync(cachePath, 'utf-8'))
      const blockMap = new Map()
      for (const [name, data] of Object.entries(cached)) {
        blockMap.set(name, data)
        if (!allBlockVersions.has(name)) allBlockVersions.set(name, new Set())
        allBlockVersions.get(name).add(v.id)
      }
      versionColors.set(v.id, blockMap)
      console.log(`  ${blockMap.size} blocks loaded from cache`)

      // Load per-face cache
      if (fs.existsSync(faceCachePath)) {
        const faceCached = JSON.parse(fs.readFileSync(faceCachePath, 'utf-8'))
        for (const [name, faces] of Object.entries(faceCached)) {
          if (!mergedFaceColors.has(name)) mergedFaceColors.set(name, {})
          // Merge: newer version overwrites
          Object.assign(mergedFaceColors.get(name), faces)
        }
        console.log(`  ${Object.keys(faceCached).length} blocks with per-face data`)
      }
      continue
    }

    try {
      const jarBuf = await downloadJar(v.id)
      const tempDir = fs.mkdtempSync(path.join(tmpdir(), 'mc-'))
      const textures = extractTextures(jarBuf, v.id, tempDir)
      const { merged, faceColors } = processTextures(textures, tempDir)

      // Save per-face colors
      const faceCachePath = path.join(outputDir, `${v.id}-faces.json`)
      const faceCacheData = {}
      for (const [name, faces] of faceColors) {
        // Only save if has at least 2 different faces
        const faceKeys = Object.keys(faces)
        if (faceKeys.length >= 2) {
          faceCacheData[name] = faces
          if (!mergedFaceColors.has(name)) mergedFaceColors.set(name, {})
          Object.assign(mergedFaceColors.get(name), faces)
        }
      }
      fs.writeFileSync(faceCachePath, JSON.stringify(faceCacheData, null, 2))

      // Save cache
      const cacheData = {}
      for (const [name, data] of merged) {
        cacheData[name] = data
        if (!allBlockVersions.has(name)) allBlockVersions.set(name, new Set())
        allBlockVersions.get(name).add(v.id)
      }
      fs.writeFileSync(cachePath, JSON.stringify(cacheData, null, 2))
      versionColors.set(v.id, merged)

      // Cleanup temp
      fs.rmSync(tempDir, { recursive: true, force: true })
      console.log(`  ${merged.size} unique blocks extracted, ${Object.keys(faceCacheData).length} with per-face data`)
    } catch (err) {
      console.error(`  Error processing ${v.id}: ${err.message}`)
      continue
    }
  }

  console.log('\n=== Building merged palette ===\n')

  // Use versionColors data to generate the palette
  // We need one color per block across all versions
  // Use the most recent version's color

  const mergedBlocks = new Map()
  for (const [name, versions] of allBlockVersions) {
    // Find the most recent version's color data
    let colorData = null
    for (const v of [...versionOrders].reverse()) {
      const vData = versionColors.get(v.id)
      if (vData && vData.has(name)) {
        colorData = vData.get(name)
        break
      }
    }
    if (colorData) {
      mergedBlocks.set(name, {
        rgb: colorData.rgb,
        fullyOpaque: colorData.fullyOpaque,
        anyTransparent: colorData.anyTransparent,
      })
    }
  }

  // Filter for 1.13+ blocks (skip 1.12.2-only texts that aren't in modern mapping)
  const versionMap = new Map()
  for (const [name, versions] of allBlockVersions) {
    // Map version set to version IDs
    const versionIds = [...versions].sort()
    versionMap.set(name, versionIds)
  }

  const ts = formatPalette(mergedBlocks, versionMap, versionOrders)
  const outputPath = path.join(process.cwd(), 'output', 'palettes.ts')
  fs.writeFileSync(outputPath, ts)

  // Output per-face colors
  const faceOutputPath = path.join(process.cwd(), 'output', 'face-colors.json')
  const faceOutput = {}
  for (const [name, faces] of mergedFaceColors) {
    // Only include blocks that survived curation (present in mergedBlocks)
    if (mergedBlocks.has(name)) {
      faceOutput[name] = faces
    }
  }
  fs.writeFileSync(faceOutputPath, JSON.stringify(faceOutput, null, 2))
  console.log(`\nFace color data: ${faceOutputPath}`)
  console.log(`Blocks with per-face data: ${Object.keys(faceOutput).length}`)

  console.log(`\nOutput: ${outputPath}`)
  console.log(`Total blocks: ${mergedBlocks.size}`)
  console.log('Done!')
}

main().catch(err => {
  console.error(err)
  process.exit(1)
})
