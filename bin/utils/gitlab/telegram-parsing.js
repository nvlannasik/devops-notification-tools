const escapeMarkdownV2 = (text) => {
  return text
    .replace(/_/g, "\\_") // Escape underscores
    .replace(/\*/g, "\\*") // Escape asterisks
    .replace(/\[/g, "\\[") // Escape open square brackets
    .replace(/\]/g, "\\]") // Escape close square brackets
    .replace(/\(/g, "\\(") // Escape open parentheses
    .replace(/\)/g, "\\)") // Escape close parentheses
    .replace(/~/g, "\\~") // Escape tildes
    .replace(/`/g, "\\`") // Escape backticks
    .replace(/>/g, "\\>") // Escape greater than
    .replace(/#/g, "\\#") // Escape hash
    .replace(/\+/g, "\\+") // Escape plus
    .replace(/=/g, "\\=") // Escape equals
    .replace(/\|/g, "\\|") // Escape pipe
    .replace(/{/g, "\\{") // Escape open curly brace
    .replace(/}/g, "\\}") // Escape close curly brace
    .replace(/!/g, "\\!"); // Escape exclamation mark
};

const getStatusIcon = (status) => {
  switch (status) {
    case "success":
      return "✅";
    case "running":
      return "⏳";
    case "failed":
      return "❌";
    default:
      return "⚪";
  }
};

const formatMessage = (data) => {
  const shortCommitId = data.commit.id.substring(0, 7);
  const commitMessage = escapeMarkdownV2(
    data.commit.message.trim().replace(/\n/g, " ").substring(0, 30)
  );

  return `
    🚀 *GitLab Pipeline Update* 
    📦 Project: ${escapeMarkdownV2(data.project.name)}
    🔖 Branch: ${escapeMarkdownV2(data.object_attributes.ref)}
    🔗 [Pipeline URL](${data.object_attributes.url})
    
    🔧 Status: ${getStatusIcon(
      data.object_attributes.status
    )} ${escapeMarkdownV2(data.object_attributes.status).toUpperCase()}
    ⏳ Duration: ${data.object_attributes.duration} seconds
    📅 Finished at: ${data.object_attributes.finished_at}
    
    🛠️ *Stages:*
    ${data.builds
      .map(
        (build) =>
          `  ${getStatusIcon(build.status)} ${escapeMarkdownV2(
            build.name
          )}: ${escapeMarkdownV2(build.status)}`
      )
      .join("\n")}
    
    👷 *Last Commit:*
      - ID: \`${shortCommitId}\`
      - Message: ${commitMessage}
      - Author: *${escapeMarkdownV2(data.commit.author.name).toUpperCase()}*
      - [Commit URL](${data.commit.url})
      `.trim();
};

module.exports = {
  formatMessage,
  escapeMarkdownV2,
};
