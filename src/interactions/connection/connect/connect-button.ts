import { Command } from "../../../types/discord";
import {userVerifCodes} from "../../../utils/temp";
import {db} from "../../../utils/db";
import {users} from "../../../schema";
import axios from "axios";
import API from "../../../utils/api";
import {EmbedBuilder} from "../../../utils/embeds";

export default {
    custom_id: "account_connect",
    role: "BUTTON",
    run: async (interaction) => {
        if (interaction.user.id !== interaction.message.interactionMetadata?.user.id) {
            return interaction.reply({
                content: "Вы не можете взаимодействовать с командой другого пользователя",
                ephemeral: true,
            });
        }
        await interaction.deferUpdate();

        const code = userVerifCodes.get(interaction.user.id);
        if (!code) {
            await interaction.editReply({ content: "Срок действия вашего кода истек или произошла ошибка, повторите попытку", embeds: [], components: [] });
            return;
        }
        const response = await API.profile(code.name);
        if (!response) {
            await interaction.editReply({ content: "Пользователь не найден, попробуйте еще раз", embeds: [], components: [] });
            return;
        }

        if(response.profile.bio.includes(code.code)) {
            try {
                await db.insert(users).values({
                    id: interaction.user.id,
                    enka_name: code.name
                }).onConflictDoUpdate({target: users.id, set: {enka_name: code.name}}).execute();
                await interaction.editReply({content: "Аккаунт успешно подключен", embeds: [], components: []});
            } catch (e: unknown) {
                await interaction.editReply({content: "Произошла ошибка при подключении учетной записи, повторите попытку", embeds: [], components: []});
            }
        } else {
            const embed = new EmbedBuilder()
                .setTitle("Неверный код")
                .setDescription("Введенный вами код неверен, повторите попытку. Ваш код:" + code.code)
            await interaction.editReply({ embeds: [embed] });
        }
    },
} satisfies Command;
