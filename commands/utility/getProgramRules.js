const { SlashCommandBuilder } = require("discord.js");
const { fetchData } = require("./../../intigritiApi");

module.exports = {
  // Define the slash command
  data: new SlashCommandBuilder()
    .setName("get_rules")
    .setDescription("Get rules of engagement for a specific program.")
    .addStringOption((option) =>
      // Define the option for the program name
      option
        .setName("program_name")
        .setDescription("Name of the program.")
        .setRequired(true)
    ),
  // Execute the command
  async execute(interaction) {
    try {
      // Defer the reply until the data is fetched
      await interaction.deferReply();

      // Get the program name from the interaction options (user iput. e.g. /get_rules Intigriti)
      const programName = interaction.options.getString("program_name");

      // Fetch all programs
      const allProgramsResponse = await fetchData(
        "/external/researcher/v1/programs?limit=200"
      );

      // Find the target program from the fetched programs
      const targetProgram = allProgramsResponse.records.find(
        (program) => program.name.toLowerCase() === programName.toLowerCase()
      );

      // If the target program is not found, send an error message
      if (!targetProgram) {
        return interaction.editReply(`No program **"${programName}"**.`);
      }

      // Get the ID of the target program
      const programId = targetProgram.id;

      // Fetch all program activities
      const programsActivitiesResponse = await fetchData(
        "/external/researcher/v1/programs/activities?limit=200"
      );

      // Find the matching activity from the fetched activities
      const matchingActivity = programsActivitiesResponse.records.find(
        (record) => record.programId === programId
      );

      // If the matching activity is not found, send an error message
      if (!matchingActivity) {
        return interaction.editReply(
          `Could not find **"${programName}"**. at /programs/activities for some reason.`
        );
      }

      // Get the version ID from the matching activity
      const versionID = matchingActivity.activity.toVersionId;

      // Fetch the rules of the target program
      const programRulesResponse = await fetchData(
        `/external/researcher/v1/programs/${programId}/rules-of-engagements/${versionID}`
      );

      // Get the rules content from the response
      const rulesContent = programRulesResponse.rulesOfEngagement.content;
      // Create an embed message with the rules content
      const embed = {
        color: 0x0099ff,
        title: `Rules of Engagement for Program ID ${programId} (Version ID: ${versionID})`,
        fields: [
          {
            // Add the description field
            name: "Description",
            value: rulesContent.description,
          },
          {
            // Add the testing requirements field
            name: "Testing Requirements",
            value: `Intigriti Me: ${rulesContent.testingRequirements.intigritiMe}\n
                  Automated Tooling: ${rulesContent.testingRequirements.automatedTooling}\n
                  Request Header: ${rulesContent.testingRequirements.requestHeader}`,
          },
        ],
        timestamp: new Date(),
        footer: {
          text: "Intigriti Bot",
        },
      };

      // Send the embed message
      await interaction.editReply({ embeds: [embed] });
    } catch (error) {
      // Log any errors
      console.error("Error fetching program rules:", error);

      // Send an error message
      await interaction.editReply({
        content: "An error occurred while fetching program rules.",
        ephemeral: true,
      });
    }
  },
};
