const mongoose = require('mongoose');

const syncMetaSchema = mongoose.Schema({
  key: {
    type: String,
    required: true,
    unique: true,
  },
  value: {
    type: Number,
    required: true,
  },
});

module.exports = mongoose.model('SyncMeta', syncMetaSchema);
