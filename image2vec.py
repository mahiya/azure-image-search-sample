import numpy as np
import tensorflow as tf
model = tf.keras.applications.EfficientNetB0(include_top=False, pooling="avg")

def image2vec(image_file_path):
    image = tf.io.read_file(image_file_path)
    image = tf.image.decode_jpeg(image, channels=3)
    vec = model.predict(np.array([image.numpy()]))[0]
    return vec.tolist()
