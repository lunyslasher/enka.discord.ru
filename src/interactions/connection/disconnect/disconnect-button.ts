import { Command } from "../../../types/discord";
import {userVerifCodes} from "../../../utils/temp";
import {get} from "../../../utils/api";
import {NoProfile, ProfileInfo} from "../../../types/enka";
import {Embed} from "../../../utils/embeds";
import {db} from "../../../utils/db";
import {users} from "../../../schema";
import {eq} from "drizzle-orm";

export default {
    custom_id: "account_disconnect",
    role: "BUTTON",
    run: async (interaction) => {
        if (interaction.user.id !== interaction.message.interactionMetadata?.user.id) {
            return interaction.reply({
                content: "Вы не можете взаимодействовать с командой другого пользователя",
                ephemeral: true,
            });
        }
        await interaction.deferUpdate();

        const user = await db.query.users.findFirst({ where: eq(users.id, interaction.user.id) });

        if(!user || !user.enka_name) {
            await interaction.editReply({ content: "У вас не привязан аккаунт", embeds: [], components: [] });
            return;
        }

        await db.delete(users).where(eq(users.id, interaction.user.id)).execute();

        await interaction.editReply({ content: "Аккаунт успешно отвязан", embeds: [], components: [] });
    },
} satisfies Command;
