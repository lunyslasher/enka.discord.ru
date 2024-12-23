import {Command} from "../../../types/discord";
import {selectCharacter} from "../../../utils/select-menus";
import {api, get} from "../../../utils/api";
import {HoyosRecord, NoProfile} from "../../../types/enka";
import {StringSelectMenuBuilder, ComponentType, ActionRowBuilder, BaseMessageOptions} from "discord.js";
import {getSelectsFromMessage, makeAllSelectsDisabled} from "../../../utils/misc";
import {generateBuildEmbed} from "../../../utils/embeds";

export default {
    custom_id: "name_select_profile",
    role: "SELECT_MENU",
    run: async (interaction) => {
        if (interaction.user.id !== interaction.message.interactionMetadata?.user.id) {
            return interaction.reply({
                content: "Вы не можете взаимодействовать с командой другого пользователя",
                ephemeral: true,
            });
        }
        await interaction.deferUpdate();

        const name = interaction.message.embeds[0].footer?.text.split(": ")[1];

        if(!name) {
            await interaction.editReply({ content: "Произошла ошибка, попробуйте еще раз", components: [], embeds: [], files: [] });
            return;
        }

        const profile = interaction.values[0];

        const apiHoyos = await api.hoyos(name);

        if (!apiHoyos) {
            await interaction.editReply({ content: "Пользователь не найден. Подключите свою учетную запись повторно или проверьте введенное имя учетной записи.", components: [], embeds: [], files: [] });
            return;
        }

        const hoyos = apiHoyos.data as HoyosRecord;

        const selectMenu = await selectCharacter(interaction, name, hoyos[profile]);

        if(!selectMenu) {
            await interaction.editReply({ content: "Произошла ошибка, попробуйте еще раз", components: [], embeds: [], files: [] });
            return;
        }

        let components = getSelectsFromMessage(interaction.message.components, ["name_select_profile"], interaction.values);

        const row = new ActionRowBuilder<StringSelectMenuBuilder>().addComponents(selectMenu);

        components = [...components, row];

        await interaction.editReply({ embeds: [generateBuildEmbed(name)], components, files: [] });
    },
} as Command;