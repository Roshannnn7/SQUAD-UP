const mongoose = require('mongoose');

const codeSnippetSchema = mongoose.Schema(
    {
        project: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Project',
            required: true,
        },
        author: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
        title: {
            type: String,
            required: true,
            trim: true,
        },
        description: {
            type: String,
            trim: true,
        },
        code: {
            type: String,
            required: true,
        },
        language: {
            type: String,
            required: true,
            default: 'javascript',
        },
        tags: [{
            type: String,
            trim: true,
        }],
        isPublic: {
            type: Boolean,
            default: true,
        },
    },
    {
        timestamps: true,
    }
);

// Indexes
codeSnippetSchema.index({ project: 1 });
codeSnippetSchema.index({ author: 1 });
codeSnippetSchema.index({ language: 1 });
codeSnippetSchema.index({ tags: 1 });

const CodeSnippet = mongoose.model('CodeSnippet', codeSnippetSchema);

module.exports = CodeSnippet;
