import {Command} from "../../../types/discord";
import {selectCharacter} from "../../../utils/select-menus";
import {api, get, getBuffer} from "../../../utils/api";
import {HoyoCharacterBuild, HoyoCharacters, HoyosRecord, NoProfile} from "../../../types/enka";
import {
    StringSelectMenuBuilder,
    ComponentType,
    ActionRowBuilder,
    EmbedBuilder,
    AttachmentBuilder,
    Attachment, StringSelectMenuOptionBuilder
} from "discord.js";
import {getSelectsFromMessage, getValues, makeAllSelectsDisabled} from "../../../utils/misc";
import {Embed} from "../../../utils/embeds";

export default {
    custom_id: "name_select_build",
    role: "SELECT_MENU",
    run: async (interaction) => {
        if (interaction.user.id !== interaction.message.interactionMetadata?.user.id) {
            return interaction.reply({
                content: "Вы не можете взаимодействовать с командой другого пользователя",
                ephemeral: true,
            });
        }
        await interaction.deferUpdate();

        const oldEmbed = interaction.message.embeds[0];

        const name = oldEmbed.footer?.text.split(": ")[1];

        if(!name) {
            await interaction.editReply({ content: "Произошла ошибка, попробуйте еще раз", components: [], embeds: [] });
            return;
        }

        const values = getValues(interaction, ["name_select_profile", "name_select_character"])

        const hash = values[0];
        const characterId = values[1];
        const buildId = values[2];

        const apiHoyos = await api.hoyosBuilds(name, hash);

        if (!apiHoyos) {
            await interaction.editReply({ content: "Пользователь не найден. Подключите свою учетную запись повторно или проверьте введенное имя учетной записи.", components: [], embeds: [] });
            return;
        }

        const builds = apiHoyos.data as HoyoCharacters;

        const characterBuilds = builds[characterId];

        if(!characterBuilds || characterBuilds.length === 0) {
            await interaction.editReply({ content: "У этого персонажа нет публичных сборок.", components: [], embeds: [] });
            return;
        }

        const build = characterBuilds.find(build => String(build.id) === buildId);

        if(!build) {
            await interaction.editReply({ content: "Данная сборка не найдена", components: [], embeds: [] });
            return;
        }

        let components = getSelectsFromMessage(interaction.message.components, ["name_select_profile", "name_select_character", "name_select_build"], values);

        const url = `https://cards.enka.network/u/${name}/${hash}/${characterId}/${build.id}/image?lang=ru`;

        const image = await getBuffer(url)

        const imgName = `${name}-${hash}-${characterId}-${build.id}.png`;

        const attachment = new AttachmentBuilder(image, { name: imgName });

        const embed = Embed()
            .setTitle(`Cборка: ${build.name || "Витрина"}`)
            .setImage(`attachment://${imgName}`)
            .setFooter({ text: `Аккаунт: ${name}`})
            .setColor(oldEmbed.color);


        return await interaction.editReply({ embeds: [embed], components, files: [attachment] });
    },
} as Command;