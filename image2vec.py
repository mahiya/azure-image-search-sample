import numpy as np
import tensorflow as tf

# ベクトル情報取得に使用するモデルを定義 (Keras の事前学習済みモデルの EfficientNet モデル)
model = tf.keras.applications.EfficientNetB0(include_top=False, pooling="avg")

def image2vec(image_file_path: str):
    """ 指定した画像ファイルのベクトル情報を取得して返す """
    image = tf.io.read_file(image_file_path)
    image = tf.image.decode_jpeg(image, channels=3)
    vec = model.predict(np.array([image.numpy()]))[0]
    return vec.tolist()
