import AdmZip from 'adm-zip'
import { PNG } from 'pngjs'
import fs from 'fs'
import path from 'path'

const VERSION = '1.21'
const MANIFEST_URL = 'https://piston-meta.mojang.com/mc/game/version_manifest_v2.json'
const TEXTURE_DIR = 'assets/minecraft/textures/block/'
const OUT_DIR = path.join(process.cwd(), 'public', 'textures')

const FACE_SUFFIXES = ['_top', '_bottom', '_side', '_front', '_back', '_north', '_south', '_east', '_west']
const STATE_EXCLUDE = ['_on', '_lit', '_powered', '_0', '_1', '_2', '_3', '_4', '_5', '_6', '_7', '_8', '_9', '_stage0', '_stage1', '_stage2']
const STATE_DEFAULT = ['_off', '_unlit', '_unpowered']
const SKIP = new Set([
  'destroy_stage_0', 'destroy_stage_1', 'destroy_stage_2', 'destroy_stage_3', 'destroy_stage_4', 'destroy_stage_5', 'destroy_stage_6', 'destroy_stage_7', 'destroy_stage_8', 'destroy_stage_9',
  'particle', 'map_icons', 'moon', 'sun', 'underwater',
  'pumpkin_face_off', 'pumpkin_face_on',
  'enchanting_table_side', 'enchanting_table_top', 'enchanting_table_bottom',
  'jukebox_side', 'jukebox_top',
])

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
  ['end_bricks', 'end_stone_bricks'],
  ['bone_block_side', 'bone_block'],
  ['bone_block_top', 'bone_block'],
  ['composter_bottom', 'composter'],
  ['composter_side', 'composter'],
  ['composter_top', 'composter'],
  ['honey_block_top', 'honey_block'],
  ['honey_block_side', 'honey_block'],
  ['honey_block_bottom', 'honey_block'],
  ['target_side', 'target'],
  ['target_top', 'target'],
  ['lodestone_side', 'lodestone'],
  ['lodestone_top', 'lodestone'],
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
  ['ancient_debris_side', 'ancient_debris'],
  ['ancient_debris_top', 'ancient_debris'],
  ['basalt_side', 'basalt'],
  ['basalt_top', 'basalt'],
  ['blackstone_top', 'blackstone'],
  ['quartz_ore', 'nether_quartz_ore'],
  ['crimson_roots', 'crimson_roots'],
  ['warped_roots', 'warped_roots'],
  ['magma', 'magma_block'],
  ['twisting_vines_plant', 'twisting_vines'],
  ['weeping_vines_plant', 'weeping_vines'],
  ['exposed_copper', 'exposed_copper'],
  ['weathered_copper', 'weathered_copper'],
  ['oxidized_copper', 'oxidized_copper'],
  ['waxed_copper_block', 'waxed_copper_block'],
  ['waxed_exposed_copper', 'waxed_exposed_copper'],
  ['waxed_weathered_copper', 'waxed_weathered_copper'],
  ['waxed_oxidized_copper', 'waxed_oxidized_copper'],
  ['deepslate_top', 'deepslate'],
  ['ochre_froglight_side', 'ochre_froglight'],
  ['ochre_froglight_top', 'ochre_froglight'],
  ['verdant_froglight_side', 'verdant_froglight'],
  ['verdant_froglight_top', 'verdant_froglight'],
  ['pearlescent_froglight_side', 'pearlescent_froglight'],
  ['pearlescent_froglight_top', 'pearlescent_froglight'],
  ['cherry_log_side', 'cherry_log'],
  ['cherry_log_top', 'cherry_log'],
  ['chiseled_bookshelf_side', 'chiseled_bookshelf'],
  ['chiseled_bookshelf_top', 'chiseled_bookshelf'],
  ['chiseled_bookshelf_empty', 'chiseled_bookshelf'],
  ['chiseled_bookshelf_occupied', 'chiseled_bookshelf'],
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
])

function getBlockName(textureName) {
  let name = textureName.replace(/\.png$/, '')

  if (SKIP.has(name)) return null

  if (TEXTURE_TO_BLOCK.has(name)) return TEXTURE_TO_BLOCK.get(name)

  for (const suffix of FACE_SUFFIXES) {
    if (name.endsWith(suffix)) {
      const base = name.slice(0, -suffix.length)
      if (TEXTURE_TO_BLOCK.has(base)) return TEXTURE_TO_BLOCK.get(base)
      if (SKIP.has(base)) return null
      return base
    }
  }

  for (const suffix of STATE_EXCLUDE) {
    if (name.endsWith(suffix)) return null
  }

  for (const suffix of STATE_DEFAULT) {
    if (name.endsWith(suffix)) {
      const base = name.slice(0, -suffix.length)
      if (TEXTURE_TO_BLOCK.has(base)) return TEXTURE_TO_BLOCK.get(base)
      return base
    }
  }

  if (name.endsWith('_horizontal') || name.endsWith('_vertical')) return null

  return name
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

function extractAndSaveTextures(jarBuf, textureDir) {
  const zip = new AdmZip(jarBuf)
  const entries = zip.getEntries()

  if (!fs.existsSync(OUT_DIR)) {
    fs.mkdirSync(OUT_DIR, { recursive: true })
  }

  const blockMapping = {} // blockId -> texture file path
  const processed = new Set() // track which block IDs we've already saved (prefer non-face textures)

  // First pass: save non-face textures
  for (const entry of entries) {
    if (!entry.entryName.startsWith(textureDir) || !entry.entryName.endsWith('.png')) continue
    const texName = path.basename(entry.entryName)
    if (texName.startsWith('_')) continue

    const blockName = getBlockName(texName)
    if (!blockName) continue

    // Check if this is a face variant (skip if we already have a non-face)
    const withoutExt = texName.replace(/\.png$/, '')
    const isFace = FACE_SUFFIXES.some(s => withoutExt.endsWith(s))
    const existingKey = Object.keys(blockMapping).find(k => k === blockName)

    if (isFace && existingKey && processed.has(blockName)) continue

    const data = entry.getData()
    const outName = `${blockName}.png`
    const outPath = path.join(OUT_DIR, outName)

    // Only save if this is the main texture or we don't have one yet
    if (!isFace || !processed.has(blockName)) {
      fs.writeFileSync(outPath, data)
      blockMapping[blockName] = outName
      processed.add(blockName)
    }
  }

  // Second pass: fill in any blocks that only have face textures
  for (const entry of entries) {
    if (!entry.entryName.startsWith(textureDir) || !entry.entryName.endsWith('.png')) continue
    const texName = path.basename(entry.entryName)
    if (texName.startsWith('_')) continue

    const blockName = getBlockName(texName)
    if (!blockName || processed.has(blockName)) continue

    const data = entry.getData()
    const outName = `${blockName}.png`
    const outPath = path.join(OUT_DIR, outName)

    fs.writeFileSync(outPath, data)
    blockMapping[blockName] = outName
    processed.add(blockName)
  }

  // Write mapping
  const mapPath = path.join(OUT_DIR, 'index.json')
  fs.writeFileSync(mapPath, JSON.stringify(blockMapping, null, 2))

  console.log(`  Saved ${processed.size} block textures to ${OUT_DIR}`)
  return blockMapping
}

async function main() {
  console.log(`=== Extracting Minecraft ${VERSION} Block Textures ===\n`)

  try {
    const jarBuf = await downloadJar(VERSION)
    console.log(`  Extracting textures...`)
    const mapping = extractAndSaveTextures(jarBuf, TEXTURE_DIR)

    console.log(`\nDone! ${Object.keys(mapping).length} textures extracted.`)
  } catch (err) {
    console.error(`Error: ${err.message}`)
    process.exit(1)
  }
}

main()
